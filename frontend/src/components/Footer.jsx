import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <section className="footer-brand">
            <p className="footer-logo">blinkit</p>
            <p className="footer-tagline">
              Groceries &amp; daily essentials delivered to your doorstep in minutes.
            </p>
            <p className="footer-delivery-badge">⚡ Delivery in 10 minutes</p>
          </section>

          <section className="footer-col">
            <h3>Useful Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
            </ul>
          </section>

          <section className="footer-col">
            <h3>Categories</h3>
            <ul>
              <li>Dairy &amp; Breakfast</li>
              <li>Snacks &amp; Munchies</li>
              <li>Cold Drinks &amp; Juices</li>
              <li>Fruits &amp; Vegetables</li>
              <li>Bakery &amp; Biscuits</li>
            </ul>
          </section>

          <section className="footer-col">
            <h3>Help &amp; Support</h3>
            <ul>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#contact">Customer Support</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </section>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Blinkit Clone. Built for learning &amp; demo purposes.</p>
          <p className="footer-note">Assignment project — Django REST + React</p>
        </div>
      </div>
    </footer>
  )
}
