import { test, expect, newBookingData } from '../fixtures/booking.fixture.js';
import type { Booking } from '../../../src/api/models/booking.js';

test('API-03 | Buscar reservas por huésped devuelve el registro creado', { tag: ['@regression', '@crud'] }, async ({ bookings, bookingData, prepareBooking }) => {
  const reservation = await test.step('Crear una reserva con un huésped que no tenga registros previos', () => prepareBooking());
  await test.step('Consultar el listado y localizar la reserva registrada', async () => {
    const response = await bookings.list();
    expect(response.status()).toBe(200);
    expect(await response.json()).toContainEqual({ bookingid: reservation.bookingid });
  });
  await test.step('Buscar al huésped y comprobar que aparece su reserva una sola vez', async () => {
    const response = await bookings.list({ firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([{ bookingid: reservation.bookingid }]);
  });
});

test('API-04 | Los cambios de una reserva se conservan al consultarla de nuevo', { tag: ['@regression', '@crud'] }, async ({ bookings, bookingData, prepareBooking }) => {
  const reservation = await test.step('Crear la reserva y comprobar su estado inicial', () => prepareBooking());
  const expected: Booking = { ...bookingData, totalprice: 450, depositpaid: false,
    bookingdates: { checkin: '2027-02-02', checkout: '2027-02-06' }, additionalneeds: 'Cena' };
  await test.step('Actualizar la reserva completa', async () => {
    const response = await bookings.update(reservation.bookingid, expected);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  });
  await test.step('Consultar la reserva y comprobar que los cambios quedaron guardados', async () => {
    const response = await bookings.findById(reservation.bookingid);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  });
});

test('API-05 | Cambiar una preferencia conserva el resto de la reserva', { tag: ['@regression', '@crud'] }, async ({ bookings, bookingData, prepareBooking }) => {
  const reservation = await test.step('Crear la reserva y comprobar sus datos originales', () => prepareBooking());
  await test.step('Solicitar el cambio de preferencias', async () => {
    const response = await bookings.patch(reservation.bookingid, { additionalneeds: 'Desayuno y cena' });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...bookingData, additionalneeds: 'Desayuno y cena' });
  });
  await test.step('Consultar y comprobar que solo cambió la preferencia solicitada', async () => {
    const response = await bookings.findById(reservation.bookingid);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...bookingData, additionalneeds: 'Desayuno y cena' });
  });
});

test('API-06 | Una reserva eliminada deja de aparecer en las consultas', { tag: ['@regression', '@crud'] }, async ({ bookings, bookingData, prepareBooking }) => {
  const reservation = await test.step('Crear una reserva y confirmar que se puede consultar', () => prepareBooking());
  await test.step('Eliminar la reserva', async () => {
    expect((await bookings.remove(reservation.bookingid)).status()).toBe(201);
  });
  await test.step('Comprobar que el detalle devuelve 404 y la búsqueda ya no la incluye', async () => {
    expect((await bookings.findById(reservation.bookingid)).status()).toBe(404);
    const response = await bookings.list({ firstname: bookingData.firstname, lastname: bookingData.lastname });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});

test('API-07 | Una actualización sin autorización no modifica la reserva', { tag: ['@regression', '@authorization'] }, async ({ bookings, bookingData, prepareBooking }) => {
  const reservation = await test.step('Crear y consultar la reserva antes del intento', () => prepareBooking());
  await test.step('Intentar actualizar sin credenciales', async () => {
    expect((await bookings.update(reservation.bookingid, { ...bookingData, totalprice: 1 }, false)).status()).toBe(403);
  });
  await test.step('Consultar y comprobar que conserva la información original', async () => {
    const response = await bookings.findById(reservation.bookingid);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(bookingData);
  });
});

test('API-08 | Las búsquedas distinguen dos reservas con datos de prueba diferentes', { tag: ['@regression', '@isolation'] }, async ({ bookings, bookingData, prepareBooking }) => {
  const other = newBookingData();
  expect(other.firstname).not.toBe(bookingData.firstname);
  const first = await test.step('Crear la primera reserva y confirmar que quedó registrada', () => prepareBooking());
  const second = await test.step('Crear otra reserva con un huésped diferente', () => prepareBooking(other));
  expect(first.bookingid).not.toBe(second.bookingid);
  await test.step('Buscar cada huésped y comprobar que solo aparece su reserva', async () => {
    for (const [data, id] of [[bookingData, first.bookingid], [other, second.bookingid]] as const) {
      const response = await bookings.list({ firstname: data.firstname, lastname: data.lastname });
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual([{ bookingid: id }]);
    }
  });
});
