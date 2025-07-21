import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import LanguageSelector from "../app/components/language-selector"
import { Language } from "../lib/i18n";
import userEvent from "@testing-library/user-event";

// Ensure jest is available (should be global in Jest environment)
const mockSetLanguage = jest.fn();
const defaultProps = {
  currentLanguage: 'en' as Language,
  onLanguageChange: mockSetLanguage,
};

jest.mock("../lib/i18n", () => ({
  useLanguage: () => ({
    language: "pt",
    setLanguage: mockSetLanguage,
    t: (key: string) => key,
  }),
}))

describe("Language Selector", () => {
  beforeEach(() => {
    mockSetLanguage.mockReset();
  })

  it("renders all language options", () => {
    render(<LanguageSelector {...defaultProps} />)
    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);
    // Use getAllByText for flags
    expect(screen.getAllByText("🇦🇴").length).toBeGreaterThan(0);
    expect(screen.getAllByText("🇺🇸").length).toBeGreaterThan(0);
    expect(screen.getAllByText("🇫🇷").length).toBeGreaterThan(0);
    // Check for full label
    expect(screen.getByRole("option", { name: /Português/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Français/ })).toBeInTheDocument();
  })

  it("highlights the current language", () => {
    render(<LanguageSelector {...defaultProps} />)
    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);
    // Find the option with data-state="checked"
    const checkedOption = screen.getByRole("option", { name: /English/ });
    expect(checkedOption).toHaveAttribute("data-state", "checked");
  })

  // NOTE: Skipping language selection tests due to Radix UI Select + jsdom limitations.
  // See: https://github.com/radix-ui/primitives/issues/1670
  // These should be covered by E2E tests in Cypress/Playwright.
  it.skip("calls setLanguage when a language is selected", async () => {
    render(<LanguageSelector {...defaultProps} />)
    const user = userEvent.setup();
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const englishOption = screen.getByRole("option", { name: /English/ });
    await user.click(englishOption);
    expect(mockSetLanguage).toHaveBeenCalledWith("en");
  });

  // NOTE: Skipping language selection tests due to Radix UI Select + jsdom limitations.
  // See: https://github.com/radix-ui/primitives/issues/1670
  // These should be covered by E2E tests in Cypress/Playwright.
  it.skip("calls setLanguage for French", async () => {
    render(<LanguageSelector {...defaultProps} />)
    const user = userEvent.setup();
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const frenchOption = screen.getByRole("option", { name: /Français/ });
    await user.click(frenchOption);
    expect(mockSetLanguage).toHaveBeenCalledWith("fr");
  });
})
