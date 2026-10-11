import { Component } from "react";

// A WebGL context can still fail after the up-front check (GPU memory exhausted, context
// limit reached). Without a boundary that error unmounts the whole page; with it, only the
// one scene falls back.
class CanvasBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("3D scene disabled:", error?.message || error);
  }

  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}

export default CanvasBoundary;
