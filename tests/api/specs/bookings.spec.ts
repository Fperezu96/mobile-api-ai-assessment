import type { APIResponse, TestInfo } from '@playwright/test';
import { test, expect, newBookingData } from '../fixtures/booking.fixture.js';
import type { Booking, CreatedBooking } from '../../../src/api/models/booking.js';

async function evidence(info: TestInfo, name: string, response: APIResponse) {
  await info.attach(name, {
    body: JSON.stringify({ status: response.status(), body: await response.text() }, null, 2),
    contentType: 'application/json',
  });
}

test('API-01 | Consultar una reserva recién creada devuelve los datos registrados', { tag: ["@api","@smoke","@regression"] }, async ({ step, bookings, bookingData, createdBookings }, info) => {
  await step('Dado que el huésped no tiene una reserva con los datos de esta prueba', async () => {
    const before = await bookings.list({ firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(before.status()).toBe(200);
    expect(await before.json()).toEqual([]);
    await info.attach('Datos de la reserva', { body: JSON.stringify(bookingData), contentType: 'application/json' });
  });
  const created = await step('Cuando registro una reserva con todos los datos obligatorios', async () => {
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
  await step('Entonces puedo consultar la reserva sin perder la información registrada', async () => {
    const response = await bookings.findById(created.bookingid);
    await evidence(info, 'Respuesta de consulta', response);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(bookingData);
  });
});

test('API-02 | Una reserva sin nombre se rechaza y no queda registrada', { tag: ["@api","@regression","@negative","@characterization"] }, async ({ step, bookings, bookingData }, info) => {
  const invalid = { ...bookingData } as Partial<typeof bookingData>;
  delete invalid.firstname;
  await step('Dado que el huésped no tiene reservas y la solicitud omite su nombre', async () => {
    const before = await bookings.list({ lastname: bookingData.lastname });
    expect(before.status()).toBe(200);
    expect(await before.json()).toEqual([]);
    await info.attach('Petición sin nombre', { body: JSON.stringify(invalid), contentType: 'application/json' });
  });
  const response = await step('Cuando intento registrar la reserva sin el nombre del huésped', async () => {
    const result = await bookings.create(invalid);
    await evidence(info, 'Respuesta de rechazo', result);
    return result;
  });
  await step('Entonces el servicio devuelve el rechazo implementado sin asignar una reserva', async () => {
    // La documentación no fija el estado de error; el código público responde 500.
    expect(response.status()).toBe(500);
    const text = await response.text();
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(text) as Record<string, unknown>; } catch { }
    expect(payload.bookingid).toBeUndefined();
  });
  await step('Y la búsqueda del huésped confirma que no se creó ningún registro', async () => {
    const after = await bookings.list({ lastname: bookingData.lastname });
    await evidence(info, 'Consulta posterior al rechazo', after);
    expect(after.status()).toBe(200);
    expect(await after.json()).toEqual([]);
  });
});

test('API-03 | Buscar reservas por huésped devuelve el registro creado', { tag: ["@api","@regression","@crud"] }, async ({ step, bookings, bookingData, prepareBooking }) => {
  const reservation = await step('Dado que existe una reserva propia con un huésped identificable', () => prepareBooking());
  await step('Cuando consulto el listado general, encuentro la reserva registrada', async () => {
    const response = await bookings.list();
    expect(response.status()).toBe(200);
    expect(await response.json()).toContainEqual({ bookingid: reservation.bookingid });
  });
  await step('Entonces el filtro por huésped devuelve únicamente su reserva', async () => {
    const response = await bookings.list({ firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([{ bookingid: reservation.bookingid }]);
  });
});

test('API-04 | Los cambios de una reserva se conservan al consultarla de nuevo', { tag: ["@api","@regression","@crud"] }, async ({ step, bookings, bookingData, prepareBooking }) => {
  const reservation = await step('Dado que puedo consultar la reserva con sus datos originales', () => prepareBooking());
  const expected: Booking = { ...bookingData, totalprice: 450, depositpaid: false,
    bookingdates: { checkin: '2027-02-02', checkout: '2027-02-06' }, additionalneeds: 'Cena' };
  await step('Cuando reemplazo los datos completos de la reserva', async () => {
    const response = await bookings.update(reservation.bookingid, expected);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  });
  await step('Entonces una nueva consulta recupera todos los cambios guardados', async () => {
    const response = await bookings.findById(reservation.bookingid);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  });
});

test('API-05 | Cambiar una preferencia conserva el resto de la reserva', { tag: ["@api","@regression","@crud"] }, async ({ step, bookings, bookingData, prepareBooking }) => {
  const reservation = await step('Dado que existe una reserva con datos originales conocidos', () => prepareBooking());
  await step('Cuando cambio únicamente las preferencias del huésped', async () => {
    const response = await bookings.patch(reservation.bookingid, { additionalneeds: 'Desayuno y cena' });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...bookingData, additionalneeds: 'Desayuno y cena' });
  });
  await step('Entonces se conserva el resto de la reserva al consultarla nuevamente', async () => {
    const response = await bookings.findById(reservation.bookingid);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...bookingData, additionalneeds: 'Desayuno y cena' });
  });
});

test('API-06 | Una reserva eliminada deja de aparecer en las consultas', { tag: ["@api","@regression","@crud"] }, async ({ step, bookings, bookingData, prepareBooking }) => {
  const reservation = await step('Dado que la reserva existe y se puede consultar', () => prepareBooking());
  await step('Cuando elimino la reserva con autorización válida', async () => {
    expect((await bookings.remove(reservation.bookingid)).status()).toBe(201);
  });
  await step('Entonces el detalle devuelve 404 y la reserva desaparece de la búsqueda', async () => {
    expect((await bookings.findById(reservation.bookingid)).status()).toBe(404);
    const response = await bookings.list({ firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});

test('API-07 | Una actualización sin autorización no modifica la reserva', { tag: ["@api","@regression","@negative","@authorization"] }, async ({ step, bookings, bookingData, prepareBooking }) => {
  const reservation = await step('Dado que conozco el estado original de la reserva', () => prepareBooking());
  await step('Cuando intento modificar la reserva sin autorización', async () => {
    expect((await bookings.update(reservation.bookingid, { ...bookingData, totalprice: 1 }, false)).status()).toBe(403);
  });
  await step('Entonces el rechazo no altera los datos que recupero al consultar', async () => {
    const response = await bookings.findById(reservation.bookingid);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(bookingData);
  });
});

test('API-08 | Las búsquedas distinguen dos reservas con datos de prueba diferentes', { tag: ["@api","@regression","@isolation"] }, async ({ step, bookings, bookingData, prepareBooking }) => {
  const other = newBookingData();
  expect(other.firstname).not.toBe(bookingData.firstname);
  const first = await step('Dado que registro una reserva para el primer huésped', () => prepareBooking());
  const second = await step('Cuando registro otra reserva para un huésped distinto', () => prepareBooking(other));
  expect(first.bookingid).not.toBe(second.bookingid);
  await step('Entonces cada búsqueda devuelve exclusivamente la reserva de su huésped', async () => {
    for (const [data, id] of [[bookingData, first.bookingid], [other, second.bookingid]] as const) {
      const response = await bookings.list({ firstname: data.firstname, lastname: data.lastname });
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual([{ bookingid: id }]);
    }
  });
});
