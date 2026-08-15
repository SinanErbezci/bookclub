interface BootstrapOffcanvas {
  hide(): void;
}

interface BootstrapOffcanvasStatic {
  getInstance(
    element: Element,
  ): BootstrapOffcanvas | null;
}

interface Bootstrap {
  Offcanvas: BootstrapOffcanvasStatic;
}

interface Window {
  bootstrap?: Bootstrap;
}