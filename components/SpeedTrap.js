import styled from "styled-components";

export const speedTrapColumns = "auto repeat(4, 110px)";

const Line = styled.li`
  display: grid;
  grid-template-columns: ${speedTrapColumns};
  align-items: center;
  padding: var(--space-3);
  border-bottom: 1px solid var(--colour-border);

  &:last-child {
    border-bottom: none;
  }
`;

const SpeedTrap = ({ racingNumber, driver, line, statsLine }) => {
  return (
    <Line>
      <span
        title="Driver"
        style={{
          backgroundColor: driver?.TeamColour ? `#${driver.TeamColour}` : 'white',
              color: "#d9dadc",
              display: "inline-block",
              width: "65px",
              textAlign: "center",
              marginRight: "var(--space-3)",
              border: `4px solid ${driver?.TeamColour ? `#${driver.TeamColour}` : 'red'}`,
              borderRadius: "5px",
        }}
      >
        {racingNumber} {driver?.Tla}
      </span>

      <div>
        <p>
          Last:{" "}
          <span
            style={{
              color: line.Speeds.I1.OverallFastest
                ? "magenta"
                : line.Speeds.I1.PersonalFastest
                ? "limegreen"
                : "var(--colour-fg)",
            }}
          >
            {line.Speeds.I1.Value || "—"} km/h
          </span>
        </p>
        <p>
          Best: <span>{statsLine.BestSpeeds.I1.Value || "—"} km/h</span>
        </p>
      </div>

      <div>
        <p>
          Last:{" "}
          <span
            style={{
              color: line.Speeds.I2.OverallFastest
                ? "magenta"
                : line.Speeds.I2.PersonalFastest
                ? "limegreen"
                : "var(--colour-fg)",
            }}
          >
            {line.Speeds.I2.Value || "—"} km/h
          </span>
        </p>
        <p>
          Best: <span>{statsLine.BestSpeeds.I2.Value || "—"} km/h</span>
        </p>
      </div>

      <div>
        <p>
          Last:{" "}
          <span
            style={{
              color: line.Speeds.FL.OverallFastest
                ? "magenta"
                : line.Speeds.FL.PersonalFastest
                ? "limegreen"
                : "var(--colour-fg)",
            }}
          >
            {line.Speeds.FL.Value || "—"} km/h
          </span>
        </p>
        <p>
          Best: <span>{statsLine.BestSpeeds.FL.Value || "—"} km/h</span>
        </p>
      </div>

      <div>
        <p>
          Last:{" "}
          <span
            style={{
              color: line.Speeds.ST.OverallFastest
                ? "magenta"
                : line.Speeds.ST.PersonalFastest
                ? "limegreen"
                : "var(--colour-fg)",
            }}
          >
            {line.Speeds.ST.Value || "—"} km/h
          </span>
        </p>
        <p>
          Best: <span>{statsLine.BestSpeeds.ST.Value || "—"} km/h</span>
        </p>
      </div>
    </Line>
  );
};

export default SpeedTrap;
