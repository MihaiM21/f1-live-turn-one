import { useState, useEffect } from "react";
import styled from "styled-components";
import { transparentize } from "polished";

const drsEnabledValues = [10, 12, 14];

const getSegmentColour = (status) => {
  switch (status) {
    case 2048:
      return "yellow";
    case 2049:
      return "limegreen";
    case 2051:
      return "magenta";
    case 2064:
      return "blue";
    default:
      return "var(--colour-offset)";
  }
};

const getTyreColour = (compound) => {
  switch (compound?.toLowerCase()) {
    case "soft":
      return "red";
    case "medium":
      return "yellow";
    case "hard":
      return "var(--colour-fg)";
    case "intermediate":
      return "green";
    case "wet":
      return "blue";
    default:
      return "var(--colour-fg)";
  }
};

const gridCols = "20px 65px 70px 64px 37px 100px 55px 60px 55px auto";
const gridColsSmall = "18px 60px 60px 60px 18px 74px 74px 44px 38px auto";

const DriverItem = styled.div`
  border-bottom: 1px solid var(--colour-border);
  background-color: ${({ posChanged }) =>
    posChanged ? transparentize(0.8, posChanged) : "transparent"};
  transition: background-color 300ms;

  > div {
    padding: 0 var(--space-3);
    height: 50px;
    display: grid;
    grid-template-columns: ${gridColsSmall};
    grid-gap: var(--space-3);
    align-items: center;
    text-align: center;


    @media screen and (min-width: 900px) {
      grid-template-columns: ${gridCols};
      grid-gap: var(--space-4);
    }
  }
`;

const ProgressBar = styled.span`
  display: block;
  width: 100%;
  height: 8px;
  background-color: var(--colour-border);
  margin: var(--space-2) 0;
  > span {
    display: block;
    height: 4px;
    transition: width 100ms linear;
    pointer-events: none;
  }
`;

const StyledTableHeader = styled.div`
  padding: var(--space-2) var(--space-3);
  background-color: var(--colour-offset);
  border-top: 1px solid var(--colour-border);
  display: grid;
  grid-template-columns: ${gridColsSmall};
  grid-gap: var(--space-3);

  @media screen and (min-width: 900px) {
    grid-template-columns: ${gridCols};
    grid-gap: var(--space-4);
  }
`;

export const TableHeader = () => (
  <StyledTableHeader>
    <p>POS</p>
    <p style={{ textAlign: "center" }}>DRIVER</p>
    <p style={{ textAlign: "center" }}>GEAR/RPM</p>
    <p style={{ textAlign: "center" }}>SPEED</p>
    <p style={{ textAlign: "center" }}>DRS</p>
    <p style={{ textAlign: "center" }}>TIME</p>
    <p style={{ textAlign: "center" }}>GAP</p>
    <p style={{ textAlign: "center" }}>TYRE</p>
    <p style={{ textAlign: "center" }}>INFO</p>
    <p style={{ textAlign: "center" }}>SECTORS</p>
  </StyledTableHeader>
);

const getPosChangeColour = (pos, gridPos) => {
  if (pos < gridPos) return "limegreen";
  if (pos > gridPos) return "red";
  return "grey";
};

const Driver = ({
  racingNumber,
  line,
  DriverList,
  CarData,
  TimingAppData,
  TimingStats,
}) => {
  const driver = DriverList[racingNumber];
  const carData =
    CarData.Entries[CarData.Entries.length - 1].Cars[racingNumber].Channels;

  const rpmPercent = (carData["0"] / 15000) * 100;
  const throttlePercent = Math.min(100, carData["4"]);
  const brakeApplied = carData["5"] > 0;

  const appData = TimingAppData?.Lines[racingNumber];
  let currentStint;
  if (appData?.Stints) {
    const stints = Object.values(appData.Stints);
    currentStint = stints[stints.length - 1];
  }

  const lineStats = Object.values(line.Stats ?? {});

  const [posChanged, setPosChanged] = useState();
  const [prevPos, setPrevPos] = useState();
  useEffect(() => {
    const pos = Number(line.Position);
    if (prevPos !== undefined && pos !== prevPos) {
      setPosChanged(getPosChangeColour(pos, prevPos));
      setTimeout(() => {
        setPosChanged(undefined);
      }, 2000);
    }

    setPrevPos(pos);
  }, [line.Position]);

  return (
    <DriverItem
      teamColour={driver?.TeamColour ? `#${driver.TeamColour}` : undefined}
      posChanged={posChanged}
    >
      <div
        style={{
          opacity: line.KnockedOut || line.Retired || line.Stopped ? 0.5 : 1,
        }}
      >
        <span>
          <span
            title="Position"
            style={{
              color:"var(--colour-fg)",
                // TimingStats.Lines[racingNumber]?.PersonalBestLapTime
                //   ?.Position === 1
                //   ? "magenta"
                //   : "var(--colour-fg)",
            }}
          >
            P{line.Position}
          </span>
          <br />
          {/* {!Number.isNaN(Number(appData?.GridPos)) && (
            <span
              title="Position change"
              style={{
                color: getPosChangeColour(
                  Number(line.Position),
                  Number(appData.GridPos)
                ),
                marginTop:"10px",
              }}
            >
              {Number(appData.GridPos) >= Number(line.Position) && "+"}
              {Number(appData.GridPos) - Number(line.Position)}
            </span>
          )} */}
        </span>
        <span
          style={{
            textAlign: "right",
          }}
        >
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
          <br />
          <span title="Status">
            {line.KnockedOut
              ? "OUT"
              : line.Retired
              ? "RETIRED"
              : line.Stopped
              ? "STOPPED"
              : line.InPit
              ? "PIT"
              : line.PitOut
              ? "PIT OUT"
              : null}
          </span>
        </span>
        <span>
          <span title="Gear" style={{ marginRight: "var(--space-4)" }}>
            {carData["3"].toString()}
          </span>{" "}
          <span title="RPM">
            {carData["0"].toString()}
          </span>
          
          <br />
          <ProgressBar title="RPM">
            <span
              style={{
                width: `${rpmPercent}%`,
                height: "8px",
                backgroundColor: "#7ec4fdff",
              }}
            />
          </ProgressBar>
        </span>
        <span >
          <span title="Speed" style={{float:"right"}}>{carData["2"].toString()} km/h</span>
          <br />
          <ProgressBar title="Throttle %">
            <span
              style={{
                width: `${throttlePercent}%`,
                height: "8px",
                backgroundColor: "limegreen",
              }}
            />
          </ProgressBar>
          <ProgressBar title="Brake">
            <span
              style={{
                width: brakeApplied ? "100%" : "0%",
                height: "8px",
                backgroundColor: "red",
              }}
            />
          </ProgressBar>
        </span>
        <span
          title={`DRS ${
            drsEnabledValues.includes(carData["45"]) ? "active" : "inactive"
          }`}
          style={{
            backgroundColor: drsEnabledValues.includes(carData["45"])
              ? "limegreen"
              : "grey",
            color: "#ffffffff",
            border: "3px solid ",
            borderRadius: "5px",
            border: `4px solid ${drsEnabledValues.includes(carData["45"])
              ? "limegreen"
              : "grey"}`,
          }}
        >
          DRS
        </span>
        <span>
          <span title="Last lap">
            Last:{" "}
            <span
              style={{
                color:
                  line.LastLapTime?.Value && line.LastLapTime?.OverallFastest
                    ? "magenta"
                    : line.LastLapTime?.Value &&
                      line.LastLapTime?.PersonalFastest
                    ? "limegreen"
                    : "var(--colour-fg)",
              }}
            >
              {line.LastLapTime?.Value || "—"}
            </span>
          </span>
          <br />
          <span title="Best lap">
            Best:{" "}
            <span
              style={{
                color:
                  line.BestLapTime?.Value &&
                  (line.BestLapTime?.OverallFastest ||
                    TimingStats.Lines[racingNumber]?.PersonalBestLapTime
                      ?.Position === 1)
                    ? "magenta"
                    : "var(--colour-fg)",
              }}
            >
              {line.BestLapTime?.Value || "—"}
            </span>
          </span>
        </span>
        <span>
          <span
            title={`Gap to car ahead${
              line.IntervalToPositionAhead?.Catching ? " (catching)" : ""
            }`}
          >
            {" "}
            <span
              style={{
                color: line.IntervalToPositionAhead?.Catching
                  ? "limegreen"
                  : "var(--colour-fg)",
              }}
            >
              {line.IntervalToPositionAhead?.Value ||
                lineStats?.[lineStats?.length - 1]?.TimeDifftoPositionAhead ||
                "—"}
            </span>
          </span>
          <br />
          <span title="Gap to leader">
            {" "}
            {line.GapToLeader ||
              lineStats?.[lineStats?.length - 1]?.TimeDiffToFastest ||
              "—"}
          </span>
        </span>
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "inline-block" }}>
            <span title="Tyre compound">
              <span style={{
                color: getTyreColour(currentStint?.Compound),
                
                }}>
                  {currentStint?.Compound[0] ?? "—"}
              </span>
            </span>
            <br />
            <span
              title={`Tyre age${
                currentStint?.New === "false" ? " (not fresh)" : ""
              }`}
            >
              {currentStint?.TotalLaps} Laps
              {currentStint?.New === "false" && "*"}
            </span>
          </span>
        </div>
        <span>
          <span title="Completed laps">Lap: {line.NumberOfLaps ?? "—"}</span>
          <br />
          <span title="Pit stops">PS: {line.NumberOfPitStops ?? "—"}</span>
        </span>
        <span style={{ display: "flex" }}>
          {(Array.isArray(line.Sectors)
            ? line.Sectors
            : Object.values(line.Sectors ?? {})
          ).map((sector, i) => {
            return (
              <span
                key={`timing-data-${racingNumber}-sector-${i}`}
                title={`Sector ${i + 1}`}
                style={{
                  marginRight: "var(--space-4)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                  }}
                >
                  {(Array.isArray(sector.Segments)
                    ? sector.Segments
                    : Object.values(sector.Segments ?? {})
                  ).map((segment, j) => (
                    <span
                      key={`timing-data-${racingNumber}-sector-${i}-segment-${j}`}
                      style={{
                        width: "4px",
                        height: "12px",
                        display: "block",
                        borderRadius: "5px",
                        marginRight: "var(--space-2)",
                        backgroundColor: getSegmentColour(segment.Status),
                      }}
                    />
                  ))}
                </span>
                {sector.Value && (
                  <span
                    style={{
                      color: sector.OverallFastest
                        ? "magenta"
                        : sector.PersonalFastest
                        ? "limegreen"
                        : "yellow",
                      marginTop: "var(--space-2)",
                      display: "inline-block",
                    }}
                  >
                    {sector.Value}
                  </span>
                )}
              </span>
            );
          })}
        </span>
      </div>
    </DriverItem>
  );
};

export default Driver;
