/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js";
import {mockStore} from "../__mocks__/store.js"; // Ajout
import {localStorageMock} from "../__mocks__/localStorage.js";
import {ROUTES} from "../constants/routes.js";
jest.mock("../app/store", () => mockStore); // permet de mocker l'API, simule son comportement lors des requêtes


describe("Given I am connected as an employee", () => {
  let newBill;
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    const html = NewBillUI();
    document.body.innerHTML = html;
    newBill = new NewBill({
      document,
      onNavigate: (pathname) =>
        (document.body.innerHTML = ROUTES({ pathname })),
      mockStore: mockStore,
      localStorage: window.localStorage,
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then element with text Envoyer une note de frais is available", () => {
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
      //to-do write assertion
    })

    test("Then the button submit is defined", () => {
      let btnSubmit = document.querySelector('#btn-send-bill');
      expect(btnSubmit).toBeDefined();
    })

    test("Then the button file is truthy ? ", () => {
      expect(screen.getByTestId('file')).toBeTruthy();
    })

    test("Then inputs is truthy ?", () => {
      expect(screen.getByTestId('expense-type')).toBeTruthy();
      expect(screen.getByTestId('expense-name')).toBeTruthy();
      expect(screen.getByTestId('datepicker')).toBeTruthy();
      expect(screen.getByTestId('amount')).toBeTruthy();
      expect(screen.getByTestId('vat')).toBeTruthy();
      expect(screen.getByTestId('pct')).toBeTruthy();
      expect(screen.getByTestId('commentary')).toBeTruthy();
    })
  })

  /*describe('When I select a file', () => {
    test('It should call handleChangeFile method', async() => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["proof.jpg"], "proof.jpg", { type: "image/jpg" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
    })
  })*/
})
