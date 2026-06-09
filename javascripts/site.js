(function () {
  const navItems = [
    { href: "index.html", label: "Home" },
    { href: "cv.html", label: "CV" },
    { href: "teaching.html", label: "Teaching" },
    { href: "teaching_statement.html", label: "Teaching Statement" },
    { href: "hornor_students.html", label: "Honor Students" },
    { href: "contest.html", label: "Math Contest Coaching" }
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  function navLink(item) {
    const isCurrent = currentPage === item.href;
    const currentAttr = isCurrent ? ' aria-current="page"' : "";
    return `<h3><a href="${item.href}"${currentAttr}>${item.label}</a></h3>`;
  }

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <header>
          <h1>Zhongmin</h1>
          <nav class="site-nav" aria-label="Main navigation">
            ${navItems.map(navLink).join("")}
          </nav>
          <b>Social</b><br>
          <div class="social-row">
            <a href="mailto:zhongmin.jin@hotmail.com" class="author-social"><i class="fa fa-fw fa-envelope-square"></i> Email</a><br>
            <a href="https://jin.zhongmin.club"><i class="fa fa-fw fa-github-square"></i> GitHub</a><br>
            <a href="https://jin.zhongmin.club" class="author-social"><i class="fa fa-fw fa-twitter-square"></i> Twitter</a><br>
            <br>
          </div>
          <br>
        </header>
      `;
    }
  }

  customElements.define("site-header", SiteHeader);
})();
