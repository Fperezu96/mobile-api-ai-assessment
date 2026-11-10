import type { APIRequestContext } from '@playwright/test';
import type { Booking } from '../models/booking.js';

// Adaptador de transporte: la prueba define las expectativas HTTP y de negocio.
export class BookingClient {
  constructor(private readonly http: APIRequestContext) {}
  create(booking: Partial<Booking>) { return this.http.post('/booking', { data: booking }); }
  findById(id: number) { return this.http.get('/booking/' + id); }
}
