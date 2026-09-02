import React from 'react';
import { colors } from '../theme';

/**
 * Error boundary that catches render-time throws per page.
 * Degrades to a readable error state instead of a blank screen.
 *
 * Usage: wrap each Route's element:
 *   <Route path="/nfl/schedule" element={
 *     <PageErrorBoundary><NflSchedulePage /></PageErrorBoundary>
 *   } />
 */
export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[PageErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '600px',
          margin: '80px auto',
          padding: '32px 24px',
          textAlign: 'center',
        }}>
          <h2 style={{ color: colors.text, marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ color: colors.textMuted, fontSize: '14px', lineHeight: 1.5 }}>
            This page encountered an error while loading. Try refreshing, or
            return to the <a href="/" style={{ color: colors.green }}>home page</a>.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              textAlign: 'left',
              background: colors.navyLight,
              color: '#e05555',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              overflow: 'auto',
              marginTop: '20px',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
