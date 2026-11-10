import { observedStep, errorDetails, type ObservedStep } from '../../support/observed-step.js';
import type { HttpExchange } from '../../../src/api/clients/booking.client.js';
import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../../../src/api/clients/booking.client.js';
import type { Booking, CreatedBooking } from '../../../src/api/models/booking.js';

export const newBookingData = (): Booking => ({
  firstname: 'QA-' + randomUUID(), lastname: 'Run-' + randomUUID(),
  totalprice: 199, depositpaid: true,
  bookingdates: { checkin: '2027-01-10', checkout: '2027-01-12' },
  additionalneeds: 'Datos de prueba',
});
type Registry = Map<number, Pick<Booking, 'firstname' | 'lastname'>>;
export const test = base.extend<{
  step: ObservedStep; httpLog: HttpExchange[]; authToken: string; bookings: BookingClient; bookingData: Booking;
  createdBookings: Registry;
  prepareBooking: (data?: Booking) => Promise<CreatedBooking>;
}>({
  httpLog: async ({}, use, info) => {
    const log: HttpExchange[] = [];
    await use(log);
    await info.attach('Historial HTTP sin autenticación', {body: JSON.stringify(log, null, 2), contentType: 'application/json'});
  },
  step: async ({httpLog}, use, info) => {
    const run = observedStep(info, async (current, error) => {
      await current.attach('Error del paso', {body: JSON.stringify(errorDetails(error), null, 2), contentType: 'application/json'});
    });
    await use(async (title, body) => {
      const start = httpLog.length;
      return run(title, async current => {
        try { return await body(current); }
        finally {
          if (httpLog.length > start) await current.attach('Peticiones y respuestas del paso', {body: JSON.stringify(httpLog.slice(start), null, 2), contentType: 'application/json'});
        }
      });
    });
  },
  authToken: async ({}, use) => {
    const username = process.env.BOOKER_USERNAME;
    const password = process.env.BOOKER_PASSWORD;
    if (!username || !password) throw new Error('Configurar las credenciales de práctica BOOKER_USERNAME y BOOKER_PASSWORD en .env local');
    // Autenticar fuera de los adjuntos y trazas para no publicar credenciales.
    const response = await fetch(new URL('/auth', process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }), signal: AbortSignal.timeout(20000),
    });
    if (response.status !== 200) throw new Error('No fue posible autenticar en Restful Booker: HTTP ' + response.status);
    const result = await response.json() as { token?: string };
    if (!result.token) throw new Error('Restful Booker no entregó un token válido');
    await use(result.token);
  },
  bookings: async ({ request, authToken, httpLog }, use) => { await use(new BookingClient(request, authToken, exchange => httpLog.push(exchange))); },
  bookingData: async ({}, use) => { await use(newBookingData()); },
  createdBookings: async ({ bookings }, use, info) => {
    const registry: Registry = new Map();
    await use(registry);
    // Limpiar solo registros propios, sin borrar datos ajenos tras un reinicio del servicio.
    for (const [id, owner] of registry) {
      const existing = await bookings.findById(id);
      if (existing.status() === 404) continue;
      if (existing.status() !== 200) {
        expect.soft(existing.status(), 'No se pudo comprobar propiedad antes de limpiar').toBe(200);
        continue;
      }
      const stored = await existing.json() as Booking;
      if (stored.firstname !== owner.firstname || stored.lastname !== owner.lastname) {
        info.annotations.push({ type: 'limpieza-omitida', description: 'El ID ' + id + ' ya no pertenece a los datos de esta prueba' });
        continue;
      }
      const removed = await bookings.remove(id);
      expect.soft(removed.status(), 'La limpieza debe eliminar la reserva propia').toBe(201);
      expect.soft((await bookings.findById(id)).status(), 'La reserva debe dejar de estar disponible').toBe(404);
    }
  },
  prepareBooking: async ({ bookings, bookingData, createdBookings }, use) => {
    await use(async (data = bookingData) => {
      const before = await bookings.list({ firstname: data.firstname, lastname: data.lastname });
      expect(before.status()).toBe(200);
      expect(await before.json(), 'Los datos de esta prueba no deben existir antes de crear').toEqual([]);
      const response = await bookings.create(data);
      expect(response.status()).toBe(200);
      const created = await response.json() as CreatedBooking;
      expect(Number.isInteger(created.bookingid)).toBe(true);
      expect(created.bookingid).toBeGreaterThan(0);
      createdBookings.set(created.bookingid, { firstname: data.firstname, lastname: data.lastname });
      expect(created.booking).toEqual(data);
      const stored = await bookings.findById(created.bookingid);
      expect(stored.status()).toBe(200);
      expect(await stored.json()).toEqual(data);
      return created;
    });
  },
});
export { expect };
