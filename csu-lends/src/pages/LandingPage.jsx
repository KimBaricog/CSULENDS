import CSULends_Logo from "../components/CsuLends_Logo";
import landingImage from "../assets/stock-image/image-for-landingpage.png";
import "./style/landingpage.css";
function LandingPage() {
  return (
    <>
      <div className="landingpage-container">
        <header>
          <CSULends_Logo />
        </header>

        <main>
          <img className="img" src={landingImage} alt="Landing page" />

          <h1>Borrow it from a classmate.</h1>
          <p>
            Need something for just one day? find it on campus, ask the owner,
            and give it back. Lend your own things for free or a small fee
          </p>
        </main>
      </div>
    </>
  );
}

export default LandingPage;
