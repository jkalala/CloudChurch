import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import MobileNavigation from "../app/components/mobile-navigation"
import { AuthProvider } from "../components/auth-provider";
import { jest } from '@jest/globals';
import { act } from "react";

const mockPush = jest.fn();

jest.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "test-id", email: "test@example.com" } } } as unknown as never)
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: "test-id", email: "test@example.com", language: "pt" }, error: null } as unknown as never)
        })
      })
    })
  }
}));
jest.mock("../lib/supabase-client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "test-id", email: "test@example.com" } } } as unknown as never)
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: "test-id", email: "test@example.com", language: "pt" }, error: null } as unknown as never)
        })
      })
    })
  }
}));
// Mock language context
jest.mock("../lib/i18n", () => ({
  useLanguage: () => ({
    language: "pt",
    t: (key: string) => {
      const translations: Record<string, string> = {
        "nav.dashboard": "Painel",
        "nav.members": "Membros",
        "nav.events": "Eventos",
        "nav.financial": "Financeiro",
        "nav.more": "Mais",
      }
      return translations[key] || key
    },
  }),
}))

jest.mock("@/lib/supabase-admin", () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "test-id", email: "test@example.com" } } } as unknown as never)
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: "test-id", email: "test@example.com", language: "pt" } } as unknown as never)
        })
      })
    })
  })
}));


describe("Mobile Navigation", () => {
  it("renders all navigation items", async () => {
    await act(async () => {
      render(<AuthProvider><MobileNavigation /></AuthProvider>);
    });
    expect(screen.getByText("Painel")).toBeInTheDocument();
    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
  });

  it("highlights the active navigation item", () => {
    render(<AuthProvider><MobileNavigation /></AuthProvider>)

    const dashboardItem = screen.getByText("Painel").closest("button")
    expect(dashboardItem).toHaveClass("text-blue-600") // Active state
  })

  it("navigates when navigation item is clicked", async () => {
    await act(async () => {
      render(<AuthProvider><MobileNavigation router={{ push: mockPush }} /></AuthProvider>);
    });
    // Find all buttons and click the one with 'Membros'
    const allButtons = screen.getAllByRole('button');
    let found = false;
    for (const btn of allButtons) {
      if (btn.textContent && btn.textContent.includes('Membros')) {
        fireEvent.click(btn);
        found = true;
        break;
      }
    }
    if (!found) throw new Error('No button with text including "Membros" found');
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard?tab=members");
    });
  })
})
