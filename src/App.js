import { ConfigProvider, Button } from "antd";
import { useState } from "react";
import "./App.css";
import CardsAnalysis from "./CardAnalysis";
import CardGame from "./CardGame.js";

function App() {
  const [cardAnalysis, setCardAnalysis] = useState(true);
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#00b96b" } }}>
      <div className="App">
        <>
          {cardAnalysis ? <CardsAnalysis /> : <CardGame />}
          <Button
            type={"link"}
            danger
            onClick={() => {
              setCardAnalysis(!cardAnalysis);
            }}
          >
            {!cardAnalysis ? "Analysis" : "Predict"}
          </Button>
        </>
      </div>
    </ConfigProvider>
  );
}

export default App;
