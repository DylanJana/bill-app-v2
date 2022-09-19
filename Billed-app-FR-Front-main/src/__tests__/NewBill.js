/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js";
import {mockStore, bills} from "../__mocks__/store.js"; // Ajout
import {localStorageMock} from "../__mocks__/localStorage.js";
import {ROUTES} from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then element with text Envoyer une note de frais is available", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
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
  })

  describe('When I am on NewBill Page', () => {
    test('I click to button to change file', async() => {

      let buttonChangeFile = screen.getByTestId('file');
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        // Envoi d'une note de frais
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) =>
        newBill.handleChangeFile(e),
      );

      buttonChangeFile.addEventListener("change", handleChangeFile); // écoute du changement
      fireEvent.change(buttonChangeFile); // Event change virtuel sur le bouton "Parcourir"
      expect(handleChangeFile).toHaveBeenCalled(); // Vérifie que la fonction simulée est appelée
      //expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); // Vérifie que le titre de la page est présent.
      //expect(screen.getByTestId("form-new-bill")).toBeTruthy(); // Vérifie que le formulaire s'affiche
    })
  })
})
