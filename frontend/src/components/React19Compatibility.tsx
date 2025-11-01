'use client';

import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';

// Configure React 19 compatibility for Ant Design
unstableSetRender((node, container) => {
  (container as any)._reactRoot ||= createRoot(container);
  const root = (container as any)._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

export default function React19Compatibility() {
  useEffect(() => {
    // This component only exists to run the compatibility setup
    // It doesn't render anything
  }, []);

  return null;
}
