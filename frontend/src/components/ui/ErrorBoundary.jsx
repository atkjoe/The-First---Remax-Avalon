import { Component } from "react";
import Button from "./Button.jsx";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-brand-mist p-6">
          <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-soft">
            <h1 className="text-2xl font-bold text-brand-ink">The page could not load</h1>
            <p className="mt-2 text-sm text-slate-600">Refresh the page or return home to continue.</p>
            <Button className="mt-5" onClick={() => window.location.assign("/")}>Go home</Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
