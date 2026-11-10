import type { AuthenticationState } from '../../models/authentication-state.js';
import type { Login } from '../../contracts/login.contract.js';
import { NativeUi, resourceSelector } from '../../support/native-ui.js';
export class LoginScreen implements Login {
  constructor(private readonly ui: NativeUi) {}
  async open(): Promise<void> {
    await this.ui.wait('menuIV'); await this.ui.element('menuIV').click();
    await this.ui.showSelector('new UiSelector().description("Login Menu Item")');
    await this.ui.driver.$('~Login Menu Item').click();
    await this.ui.wait('nameET');
  }
  async submit(username: string, password: string): Promise<void> {
    await this.ui.element('nameET').setValue(username);
    await this.ui.element('passwordET').setValue(password);
    if (await this.ui.driver.isKeyboardShown()) await this.ui.driver.hideKeyboard();
    await this.ui.show('loginBtn'); await this.ui.element('loginBtn').click();
  }
  async errorVisible(): Promise<boolean> { return await this.ui.visible('nameErrorTV') || await this.ui.visible('passwordErrorTV'); }
  async formVisible(): Promise<boolean> { return this.ui.visible('loginBtn'); }
  async readAuthenticationMenu(): Promise<AuthenticationState> {
    await this.ui.element('menuIV').click();
    // El elemento cambia según el estado de autenticación y está al final del menú.
    await this.ui.showSelector(resourceSelector('itemTV') + '.textMatches("Log In|Log Out")');
    return { loginVisible: await this.ui.driver.$('~Login Menu Item').isDisplayed(), logoutVisible: await this.ui.driver.$('~Logout Menu Item').isExisting() };
  }
}
