'use client';

import React from 'react';

export class ReviewerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Reviewer UI Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center space-y-2">
          <h2 className="text-lg font-medium">Something went wrong</h2>
          <p className="text-sm text-slate-500">
            The review interface encountered an error. Please refresh.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
