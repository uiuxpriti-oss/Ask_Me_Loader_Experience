import { useState } from "react"
import { assetUrl } from "./assets"

const assetPath = assetUrl("assets/sidebar")
const mobileAssetPath = assetUrl("assets/mobile-sidebar")

const mobileNavItems = [
  ["New Analysis", "878cc.svg"],
  ["Search", "ee28c.svg"],
  ["Data Pool", "a837f.svg"],
  ["Manage Responses", "2e6fa.svg"],
] as const

const analysisTitles = [
  "The Sales and Profit Financial Overview offers a detailed look at revenue streams and profitability, essential for strategic planning.",
  "Explore the Beta Insights Report, where we delve into key metrics and insights that drive business success and innovation.",
  "The Sales and Profit Financial Overview offers a detailed look at revenue streams and profitability, essential for strategic planning.",
  "Uncover valuable information in the Gamma Insights Report, highlighting critical developments and forecasts in your industry.",
  "The Sales and Profit Financial Overview offers a detailed look at revenue streams and profitability, essential for strategic planning.",
  "Gain insights into market performance with the Epsilon Insights Report, featuring analysis that informs your strategic initiatives.",
  "The Zeta Insights Report provides an in-depth look at emerging trends and their potential impact on your business landscape.",
  "Dive into the Eta Insights",
  "The Theta Insights Report offers a comprehensive overview of market shifts and opportunities, essential for informed decision-making.",
  "Explore the Iota Insights",
  "The Kappa Insights Report focuses on industry benchmarks and performance metrics, providing a roadmap for success.",
  "Discover key insights",
  "Dive into the Eta Insights",
  "The Mu Insights Report",
  "Unveil the latest findings in the Nu Insights Report, which highlights significant trends and their implications for your business.",
  "Explore the Iota Insights",
  "Explore the Iota Insights",
  "The Sales and Profit Financial Overview offers a detailed look at revenue streams and profitability, essential for strategic planning.",
  "The Sales and Profit Financial Overview offers a detailed look at revenue streams and profitability, essential for strategic planning.",
  "The Sales and Profit Financial Overview offers a detailed look at revenue streams and profitability, essential for strategic planning.",
]

type SidebarButtonProps = {
  label: string
  asset: string
  size?: 18 | 22 | 28
}

function SidebarButton({ label, asset, size = 18 }: SidebarButtonProps) {
  return (
    <button
      className={`sidebar__button sidebar__button--${size}`}
      aria-label={label}
      title={label}
    >
      <img
        src={`${assetPath}/${asset}`}
        alt=""
        width={size}
        height={size}
        aria-hidden="true"
      />
    </button>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className={`mobile-header ${open ? "mobile-header--open" : ""}`}>
        <button
          className={`mobile-menu-toggle ${
            open ? "mobile-menu-toggle--open" : ""
          }`}
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="primary-sidebar"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <img
              src={`${mobileAssetPath}/d42dc.svg`}
              alt=""
              width="24"
              height="24"
              aria-hidden="true"
            />
          ) : (
            <span className="mobile-menu-icon" aria-hidden="true">
              <img src={assetUrl("assets/6bb1d.svg")} alt="" />
              <img src={assetUrl("assets/e1134.svg")} alt="" />
              <img src={assetUrl("assets/6bb1d.svg")} alt="" />
            </span>
          )}
        </button>

        <button
          className="mobile-header__more"
          type="button"
          aria-label="More options"
        >
          <img src={assetUrl("assets/33d79.svg")} alt="" aria-hidden="true" />
        </button>
        <span className="mobile-header__fade" aria-hidden="true" />
      </header>

      <button
        className={`sidebar-backdrop ${open ? "sidebar-backdrop--open" : ""}`}
        type="button"
        aria-label="Close navigation menu"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside
        id="primary-sidebar"
        className={`sidebar ${open ? "sidebar--open" : ""}`}
        aria-label="Primary navigation"
        aria-hidden={!open ? undefined : false}
        data-node-id="8008:1510"
      >
        <div className="sidebar__container">
          <SidebarButton label="Ask Me" asset="53a5d.svg" size={22} />

          <nav className="sidebar__nav" aria-label="Workspace">
            <div className="sidebar__primary">
              <SidebarButton label="New analysis" asset="878cc.svg" />
              <SidebarButton label="Search" asset="ee28c.svg" />
              <SidebarButton label="Files" asset="a837f.svg" />
              <SidebarButton label="Saved" asset="2e6fa.svg" />
            </div>

            <img
              className="sidebar__divider"
              src={`${assetPath}/f59cb.svg`}
              alt=""
              width="32"
              height="1"
              aria-hidden="true"
            />

            <SidebarButton label="History" asset="499b0.svg" />
          </nav>

          <div className="sidebar__utilities">
            <img
              className="sidebar__divider sidebar__divider--bottom"
              src={`${assetPath}/7dd1e.svg`}
              alt=""
              width="30"
              height="1"
              aria-hidden="true"
            />
            <SidebarButton label="Ask Me users" asset="5a233.svg" />
            <SidebarButton label="Notifications" asset="e3963.svg" />
            <SidebarButton label="Help" asset="576b9.svg" />
            <SidebarButton label="Profile" asset="42c3a.png" size={28} />
          </div>
        </div>

        <div className="mobile-sidebar">
          <div className="mobile-sidebar__brand">
            <div>
              <img
                src={`${mobileAssetPath}/8980a.svg`}
                alt=""
                width="28"
                height="28"
                aria-hidden="true"
              />
              <span>Ask Me</span>
            </div>
          </div>

          <div className="mobile-sidebar__body">
            <nav
              className="mobile-sidebar__primary"
              aria-label="Mobile workspace"
            >
              {mobileNavItems.map(([label, asset]) => (
                <button type="button" key={label}>
                  <span className="mobile-sidebar__nav-icon">
                    <img
                      src={`${assetPath}/${asset}`}
                      alt=""
                      width="18"
                      height="18"
                      aria-hidden="true"
                    />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <section
              className="mobile-sidebar__history"
              aria-labelledby="analysis-history-title"
            >
              <div className="mobile-sidebar__history-heading">
                <span id="analysis-history-title">
                  All analysis
                  <img
                    src={`${mobileAssetPath}/53e77.svg`}
                    alt=""
                    width="13"
                    height="13"
                    aria-hidden="true"
                  />
                </span>
                <span className="mobile-sidebar__count">20/50</span>
              </div>

              <div className="mobile-sidebar__analyses">
                {analysisTitles.map((title, index) => {
                  const pinned = index === 2
                  return (
                    <div
                      className={`mobile-analysis ${
                        pinned ? "mobile-analysis--selected" : ""
                      }`}
                      key={`${title}-${index}`}
                    >
                      <button
                        className="mobile-analysis__title"
                        type="button"
                        title={title}
                      >
                        {title}
                      </button>
                      <button
                        className={
                          pinned
                            ? "mobile-analysis__pin"
                            : "mobile-analysis__menu"
                        }
                        type="button"
                        aria-label={
                          pinned ? `Unpin ${title}` : `Options for ${title}`
                        }
                      >
                        <img
                          src={`${mobileAssetPath}/${
                            pinned ? "92d23.svg" : "4ec57.svg"
                          }`}
                          alt=""
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <footer className="mobile-sidebar__profile">
            <div className="mobile-sidebar__identity">
              <img
                src={`${mobileAssetPath}/23e18.png`}
                alt=""
                width="34"
                height="34"
                aria-hidden="true"
              />
              <div>
                <strong>Priti J</strong>
                <span>Pro</span>
              </div>
            </div>
            <button type="button" aria-label="Training Ask Me">
              <img
                src={`${mobileAssetPath}/4119f.svg`}
                alt=""
                width="24"
                height="24"
                aria-hidden="true"
              />
            </button>
          </footer>
        </div>
      </aside>
    </>
  )
}
