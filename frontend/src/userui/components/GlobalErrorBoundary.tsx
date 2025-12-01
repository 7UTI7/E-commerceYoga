// src/userui/components/GlobalErrorBoundary.tsx
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; msg?: string };

export default class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, msg: "" };
  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, msg: err instanceof Error ? err.message : String(err) };
  }
  componentDidCatch(err: unknown, info: unknown) {
    console.error("[UI ERROR]", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
          <div className="max-w-md text-center p-6 border rounded-lg shadow bg-white">
            <h1 className="text-lg font-semibold mb-2">Ocorreu um erro na interface</h1>
            <p className="text-sm text-gray-600 mb-4">{this.state.msg || "Erro inesperado."}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
