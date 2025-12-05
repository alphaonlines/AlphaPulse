export class CollapsibleSections {
  initialize() {
    const sections = document.querySelectorAll('.collapsible');

    sections.forEach(section => {
      const toggle = section.querySelector('.section-toggle');
      const body = section.querySelector('.collapsible-body');

      if (!toggle || !body) return;

      const collapsed = section.dataset.collapsed === 'true';
      this.setSectionState(section, toggle, collapsed);

      toggle.addEventListener('click', () => {
        const isCollapsed = section.dataset.collapsed === 'true';
        this.setSectionState(section, toggle, !isCollapsed);
      });
    });
  }

  setSectionState(section, toggle, collapsed) {
    section.dataset.collapsed = collapsed ? 'true' : 'false';
    section.classList.toggle('is-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', (!collapsed).toString());
    const label = toggle.querySelector('.toggle-label');
    if (label) {
      label.textContent = collapsed ? 'Show' : 'Hide';
    }
  }
}
