/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"; // Ajout
jest.mock("../app/store", () => mockStore); // permet de mocker l'API, simule son comportement lors des requêtes

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      /***** [END INTEGRATION TEST] I check if windowIcon has a class active-icon. If is correct the test passed and icon is highlight  */
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      // Tri par date : de la plus récente à la plus lointaine
      const sortBills = bills.sort((a, b) => (a.date < b.date ? 1: -1));
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      console.log("Dates ", dates);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    })
  })
})

/****** [Add unit test to Bill.js] */
/* 1. Button with [data-testid='btn-new-bill'] is visible ? */
describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      // permet de définir de nouvelles propriétés, ici stockage de données dans le navigateur web sans faire intervenir le serveur
      value: localStorageMock, // localStorageMock est affecté à la propriété value de localStorage
    });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee", // Employee est défini comme utilisateur
      })
    );
  });

  describe("When I am on Bills Page", () => {
    test("Button with [data-testid='btn-new-bill'] is defined ?", () => {
      let btnNewBillVisible = screen.getByTestId('btn-new-bill');
      expect(btnNewBillVisible).toBeDefined();
    })

    test("User click on buttonNewBill, handleClickNewBill is called ?", async() => {
      let buttonNewBill = screen.getByTestId('btn-new-bill');
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const employeeBill = new Bills({
        // création d'une note de frais
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn((e) =>
        employeeBill.handleClickNewBill(e)
      );

      buttonNewBill.addEventListener("click", handleClickNewBill); // écoute du clic
      userEvent.click(buttonNewBill); // click virtuel sur le bouton "Nouvelle note de frais"
      expect(handleClickNewBill).toHaveBeenCalled(); // Vérifie que la fonction simulée est appelée
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); // Vérifie que le titre de la page est présent.
      expect(screen.getByTestId("form-new-bill")).toBeTruthy(); // Vérifie que le formulaire s'affiche
    })
  })
})
