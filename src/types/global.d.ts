// Global ambient type declarations for assets and styling
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.sass' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.less' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.svg' {
  import type React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ico';
