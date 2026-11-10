import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from '../models/booking.js';

// El cliente encapsula HTTP; los escenarios mantienen las expectativas del negocio.
export class BookingClient {
  constructor(private readonly http: APIRequestContext, private readonly token: string) {}
  private async send(action: () => Promise<APIResponse>) {
    try { return await action(); }
    catch (error) { throw new Error(String(error).replaceAll(this.token, '[TOKEN OCULTO]')); }
  }
  create(booking: Partial<Booking>) { return this.send(() => this.http.post('/booking', { data: booking })); }
  findById(id: number) { return this.send(() => this.http.get('/booking/' + id)); }
  list(filters: { firstname?: string; lastname?: string } = {}) { return this.send(() => this.http.get('/booking', { params: filters })); }
  update(id: number, booking: Booking, authorized = true) {
    return this.send(() => this.http.put('/booking/' + id, { data: booking, headers: authorized ? { Cookie: 'token=' + this.token } : {} }));
  }
  patch(id: number, changes: Partial<Booking>) {
    return this.send(() => this.http.patch('/booking/' + id, { data: changes, headers: { Cookie: 'token=' + this.token } }));
  }
  remove(id: number) { return this.send(() => this.http.delete('/booking/' + id, { headers: { Cookie: 'token=' + this.token } })); }
}
