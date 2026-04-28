import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#000', minHeight: '100dvh', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: 'monospace', color: '#c9a866',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>NOCTUA · STARTUP ERROR</div>
          <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 1.6, wordBreak: 'break-all' }}>
            {this.state.error.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
