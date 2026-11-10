import type { APIResponse, TestInfo } from '@playwright/test';
import { test, expect } from '../fixtures/booking.fixture.js';
import type { CreatedBooking } from '../../../src/api/models/booking.js';

async function evidence(info: TestInfo, name: string, response: APIResponse) {
  await info.attach(name, {
    body: JSON.stringify({ status: response.status(), body: await response.text() }, null, 2),
    contentType: 'application/json',
  });
}

test('API-01 @smoke @regression Crear y consultar una reserva conserva sus datos', async ({ bookings, bookingData }, info) => {
  await test.step('Dado un huésped sintético y fechas válidas', async () => {
    await info.attach('Datos esperados antes de ejecutar', { body: JSON.stringify(bookingData), contentType: 'application/json' });
  });
  const created = await test.step('Cuando creo la reserva', async () => {
    const response = await bookings.create(bookingData);
    await evidence(info, 'Respuesta de creación', response);
    expect(response.status()).toBe(200);
    const result = await response.json() as CreatedBooking;
    expect(Number.isInteger(result.bookingid)).toBe(true);
    expect(result.bookingid).toBeGreaterThan(0);
    expect(result.booking).toEqual(bookingData);
    info.annotations.push({ type: 'cleanup-pending', description: 'Reserva sintética creada: ' + result.bookingid + '. Limpieza autenticada pendiente.' });
    return result;
  });
  await test.step('Entonces al consultarla recupero los mismos datos', async () => {
    const response = await bookings.findById(created.bookingid);
    await evidence(info, 'Respuesta de consulta', response);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(bookingData);
  });
});

test('API-02 @regression Rechazar una reserva sin nombre obligatorio', async ({ bookings, bookingData }, info) => {
  const invalid = { ...bookingData } as Partial<typeof bookingData>;
  delete invalid.firstname;
  await test.step('Dado que falta firstname que el contrato declara obligatorio', async () => {
    await info.attach('Petición inválida', { body: JSON.stringify(invalid), contentType: 'application/json' });
  });
  const response = await test.step('Cuando intento crear la reserva', async () => {
    const result = await bookings.create(invalid);
    await evidence(info, 'Respuesta de rechazo', result);
    return result;
  });
  await test.step('Entonces recibo un rechazo controlado y no una reserva válida', async () => {
    // The contract lists firstname as required but does not specify its error status.
    // 400/422 is our predeclared quality expectation; never accept 500 to force green.
    expect.soft([400, 422]).toContain(response.status());
    const text = await response.text();
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(text) as Record<string, unknown>; } catch { /* Text errors are allowed. */ }
    expect(payload.bookingid).toBeUndefined();
  });
});
