export const showcaseContent = {
  previousImageLabel: 'Previous image', nextImageLabel: 'Next image',
  closeLabel: 'Close project dialog', galleryLabel: 'Gallery images',
  fallbackTitle: 'Project gallery', fallbackProject: 'Project',
  descriptionLabel: 'Project description', stackLabel: 'Tech stack',
  projectLabel: 'View Project', codeLabel: 'View Code',
  unavailableLabel: 'Image unavailable.', retryLabel: 'Retry',
  zoomLabel: 'Image zoom', zoomInLabel: 'Zoom in', zoomOutLabel: 'Zoom out',
  resetZoomLabel: 'Reset image zoom', zoomHint: 'Pinch to zoom · Drag to explore',
  imageLabel: (index: number) => `View image ${index}`,
  screenshotAlt: (title: string, index: number, total: number) => `${title} screenshot ${index} of ${total}`,
}
