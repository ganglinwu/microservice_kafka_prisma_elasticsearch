import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import Header from "./header";

describe("Header component tests", () => {
  it("should display header correctly", () => {
    render(
      <BrowserRouter>
        <Header></Header>
      </BrowserRouter>,
    );

    expect(screen.getByText("TechHub")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText(/Cart \(\d+\)/)).toBeInTheDocument();
  });
});
