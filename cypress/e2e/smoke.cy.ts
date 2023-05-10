import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /regístrate/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("link", { name: /anotar/i }).click();
    cy.findByRole("button", { name: /salir/i }).click();
    cy.findByRole("link", { name: /ingresar/i });
  });

  it("should allow you to add a note", () => {
    const testNote = {
      url: "https://www.jornada.com.mx/",
      customId: faker.lorem.words(1),
    };
    cy.login();

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /mis contribuciones/i }).click();


    cy.findByRole("link", { name: /\+ agregar/i }).click();

    cy.findByRole("textbox", { name: /url-1/i }).type(testNote.url);
    cy.findByRole("textbox", { name: /Identificador/i }).type(testNote.customId);
    cy.findByRole("button", { name: /guardar/i }).click();
  });
});
