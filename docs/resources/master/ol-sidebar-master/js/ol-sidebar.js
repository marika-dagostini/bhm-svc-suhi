window.Sidebar = class Sidebar extends ol.control.Control {
  constructor(options = {}) {
    const defaults = {
      element: null,
      position: 'left',
      target: null
    };

    const settings = { ...defaults, ...options };

    const element = document.getElementById(settings.element);
	super({ element, target: element.parentElement });

    this.element.classList.add('sidebar-' + settings.position);

    // Find sidebar > div.sidebar-content
    this._container = this.element.querySelector('.sidebar-content');

    // Find sidebar-tabs > li
    this._tabitems = this.element.querySelectorAll('ul.sidebar-tabs > li, .sidebar-tabs > ul > li');
    this._tabitems.forEach(tab => (tab._sidebar = this));

    // Find all sidebar panes and close buttons
    this._panes = Array.from(this._container.querySelectorAll('.sidebar-pane'));
    this._closeButtons = Array.from(this._container.querySelectorAll('.sidebar-close'));
  }

  setMap(map) {
    super.setMap(map);

    // Bind tab click events
    this._tabitems.forEach(tab => {
      const link = tab.querySelector('a');
      if (link && link.getAttribute('href')?.startsWith('#')) {
        link.addEventListener('click', this._onClick.bind(tab));
      }
    });

    // Bind close button events
    this._closeButtons.forEach(button => {
      button.addEventListener('click', this._onCloseClick.bind(this));
    });
  }

  open(id) {
    // Show selected pane
    this._panes.forEach(pane => {
      pane.classList.toggle('active', pane.id === id);
    });

    // Highlight selected tab
    this._tabitems.forEach(tab => {
      const link = tab.querySelector('a');
      tab.classList.toggle('active', link && link.hash === `#${id}`);
    });

    // Show sidebar if collapsed
    this.element.classList.remove('collapsed');

    return this;
  }

  close() {
    this._tabitems.forEach(tab => tab.classList.remove('active'));
    this.element.classList.add('collapsed');
    return this;
  }

  _onClick(evt) {
    evt.preventDefault();
    if (this.classList.contains('active')) {
      this._sidebar.close();
    } else if (!this.classList.contains('disabled')) {
      const hash = this.querySelector('a').hash.slice(1);
      this._sidebar.open(hash);
    }
  }

  _onCloseClick() {
    this.close();
  }
}
