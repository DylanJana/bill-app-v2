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
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    })
  })
})

/****** [Add unit test to Bill.js] */
/*** Test Get Bills */
// test d'intégration GET
describe("Given I am a user connected as User", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const typeCol  = await screen.getByText("Type")
      expect(typeCol).toBeTruthy()
      const nameCol  = await screen.getByText("Nom")
      expect(nameCol).toBeTruthy()
      const dateCol  = await screen.getByText("Date")
      expect(dateCol).toBeTruthy()
      const amountCol  = await screen.getByText("Montant")
      expect(amountCol).toBeTruthy()
      const statusCol  = await screen.getByText("Statut")
      expect(statusCol).toBeTruthy()
      const actionsCol  = await screen.getByText("Actions")
      expect(actionsCol).toBeTruthy()
      //expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText("Erreur")
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText("Erreur")
      expect(message).toBeTruthy()
    })
  })

  })
})

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
    test("Div with [data-testid='icon-eye'] is defined ?", () => {
      let btnEye = screen.getAllByTestId('icon-eye'); // Récupére les div avec un data-testid = "icon-eye"
      expect(btnEye).toBeDefined(); // Les icônes en forme d'oeil sont-ils définis ?
    })

    test("Where user click on an eye, handleClickIconEye is called ?", async() => {
      $.fn.modal = jest.fn();
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

      const handleClickIconEye = jest.fn((icon) => {
        employeeBill.handleClickIconEye(icon);
        userEvent.click(icon);
      });

        let btnEye = screen.getAllByTestId('icon-eye');
        if (btnEye) btnEye.forEach(icon => 
          icon.addEventListener("click", handleClickIconEye(icon))
          );
        expect(handleClickIconEye).toHaveBeenCalled(); // Vérifie que la fonction simulée est appelée
    })

    test("Modal is defined ?", () => {
      let modal = document.querySelector('#modaleFile');
      expect(modal).toBeDefined();
    })

    test("The button to close modal is defined ?", () => {
      let closeBtnModal = document.querySelector('.close');
      expect(closeBtnModal).toBeDefined(); 
    })

    test('Modal Picture alt is equal to Bill ?', () => {
      let modalPic = document.querySelector('.bill-proof-container img');
      let modalAlt = screen.getByAltText('Bill');
      expect(modalPic).toBeDefined();
      expect(modalAlt.alt).toEqual('Bill');
    })
  })

  describe("When I am on Bills Page", () => {
    test("Button with [data-testid='btn-new-bill'] is defined ?", () => {
      let btnNewBillVisible = screen.getByTestId('btn-new-bill');
      expect(btnNewBillVisible).toBeDefined();
    });

    test('Array with data is defined ?', () => {
      let arrayData = screen.getByTestId('tbody');
      expect(arrayData).toBeDefined();
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
        employeeBill.handleClickNewBill(e),
      );

      buttonNewBill.addEventListener("click", handleClickNewBill); // écoute du clic
      userEvent.click(buttonNewBill); // click virtuel sur le bouton "Nouvelle note de frais"
      expect(handleClickNewBill).toHaveBeenCalled(); // Vérifie que la fonction simulée est appelée
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); // Vérifie que le titre de la page est présent.
      expect(screen.getByTestId("form-new-bill")).toBeTruthy(); // Vérifie que le formulaire s'affiche
    })
  })
})