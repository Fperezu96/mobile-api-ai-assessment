import type { APIResponse, TestInfo } from '@playwright/test';
import { test, expect } from '../fixtures/booking.fixture.js';
import type { CreatedBooking } from '../../../src/api/models/booking.js';

async function evidence(info: TestInfo, name: string, response: APIResponse) {
  await info.attach(name, {
    body: JSON.stringify({ status: response.status(), body: await response.text() }, null, 2),
    contentType: 'application/json',
  });
}

test('API-01 | Consultar una reserva recién creada devuelve los datos registrados', { tag: ['@smoke', '@regression'] }, async ({ bookings, bookingData, createdBookings }, info) => {
  await test.step('Definir los datos de la reserva', async () => {
    const before = await bookings.list({ firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(before.status()).toBe(200);
    expect(await before.json()).toEqual([]);
    await info.attach('Datos de la reserva', { body: JSON.stringify(bookingData), contentType: 'application/json' });
  });
  const created = await test.step('Registrar la reserva y conservar su identificador', async () => {
    const response = await bookings.create(bookingData);
    await evidence(info, 'Respuesta de creación', response);
    expect(response.status()).toBe(200);
    const result = await response.json() as CreatedBooking;
    expect(Number.isInteger(result.bookingid)).toBe(true);
    expect(result.bookingid).toBeGreaterThan(0);
    createdBookings.set(result.bookingid, { firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(result.booking).toEqual(bookingData);
    return result;
  });
  await test.step('Consultar la reserva y comparar la información registrada', async () => {
    const response = await bookings.findById(created.bookingid);
    await evidence(info, 'Respuesta de consulta', response);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(bookingData);
  });
});

test('API-02 | No se permite crear una reserva sin el nombre del huésped', { tag: ['@regression', '@quality-policy'] }, async ({ bookings, bookingData, createdBookings }, info) => {
  const invalid = { ...bookingData } as Partial<typeof bookingData>;
  delete invalid.firstname;
  await test.step('Preparar los datos de la reserva sin el nombre del huésped', async () => {
    await info.attach('Petición inválida', { body: JSON.stringify(invalid), contentType: 'application/json' });
  });
  const response = await test.step('Enviar la solicitud de creación', async () => {
    const result = await bookings.create(invalid);
    await evidence(info, 'Respuesta de rechazo', result);
    return result;
  });
  await test.step('Comprobar que se rechaza la solicitud y no se crea una reserva', async () => {
    // El contrato exige firstname, pero no especifica el estado HTTP de error.
    // Esperamos un error de entrada y conservamos el fallo si el servidor responde 500.
    expect.soft([400, 422]).toContain(response.status());
    const text = await response.text();
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(text) as Record<string, unknown>; } catch { /* La respuesta de error puede ser texto. */ }
    expect(payload.bookingid).toBeUndefined();
  });
});
