import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import moment from "moment";
import ResponsiveTable from "/components/ResponsiveTable";
import Driver, { TableHeader } from "/components/Driver";
import Radio from "/components/Radio";
import Map from "/components/Map";
import Input from "/components/Input";
import SpeedTrap, { speedTrapColumns } from "/components/SpeedTrap";
import WeatherCircle from "@f1-live-turn-one/components/WeatherCircle";

const f1Url = "https://livetiming.formula1.com";

const sortPosition = (a, b) => {
  const [, aLine] = a;
  const [, bLine] = b;
  const aPos = Number(aLine.Position);
  const bPos = Number(bLine.Position);
  return aPos - bPos;
};

const sortUtc = (a, b) => {
  const aDate = moment.utc(a.Utc);
  const bDate = moment.utc(b.Utc);
  return bDate.diff(aDate);
};

const getFlagColour = (flag) => {
  switch (flag?.toLowerCase()) {
    case "green":
      return { bg: "green" };
    case "yellow":
    case "double yellow":
      return { bg: "yellow", fg: "var(--colour-bg)" };
    case "red":
      return { bg: "red" };
    case "blue":
      return { bg: "blue" };
    default:
      return { bg: "transparent" };
  }
};
const getColorForKey = (key)=> {
    switch (key) {
        case 'TrackTemp':
            return '#ff6600'; // portocaliu
        case 'AirTemp':
            return '#3399ff'; // albastru
        case 'WindSpeed':
            return '#66cc66'; // verde
        default:
            return '#cccccc'; // gri fallback
    }
};
const excludedKeys = ["_kf", "Rainfall", "WindDirection"];
const getCircleColor = (key) => {
    switch (key) {
        case "AirTemp":
            return "blue";
        case "TrackTemp":
            return "red";
        case "WindSpeed":
            return "gray";
        default:
            return null;
    }
};
const getWeatherUnit = (key) => {
  switch (key) {
    case "AirTemp":
    case "TrackTemp":
      return;
        //return "°";
    case "Humidity":
      return;
        //return "%";
    case "Pressure":
      return;
        //return " mbar";
    case "WindDirection":
      return "°";
    case "WindSpeed":
      return " km/h";
    default:
      return null;
  }
};

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [liveState, setLiveState] = useState({});
  const [updated, setUpdated] = useState(new Date());
  const [delayMs, setDelayMs] = useState(0);
  const [delayTarget, setDelayTarget] = useState(0);
  const [blocking, setBlocking] = useState(false);
  const [triggerConnection, setTriggerConnection] = useState(0);
  const [triggerTick, setTriggerTick] = useState(0);

  const socket = useRef();
  const retry = useRef();

  const initWebsocket = (handleMessage) => {
    if (retry.current) {
      clearTimeout(retry.current);
      retry.current = undefined;
    }

    const wsUrl =
      `${window.location.protocol.replace("http", "ws")}//` +
      window.location.hostname +
      (window.location.port ? `:${window.location.port}` : "") +
      "/ws";

    const ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      setConnected(true);
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      setBlocking((isBlocking) => {
        if (!retry.current && !isBlocking)
          retry.current = window.setTimeout(() => {
            initWebsocket(handleMessage);
          }, 1000);
      });
    });

    ws.addEventListener("error", () => {
      ws.close();
    });

    ws.addEventListener("message", ({ data }) => {
      setTimeout(() => {
        handleMessage(data);
      }, delayMs);
    });

    socket.current = ws;
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/worker.js");
    }
  }, []);

  useEffect(() => {
    setLiveState({});
    setBlocking(false);
    initWebsocket((data) => {
      try {
        const d = JSON.parse(data);
        setLiveState(d);
        setUpdated(new Date());
      } catch (e) {
        console.error(`could not process message: ${e}`);
      }
    });
  }, [triggerConnection]);

  useEffect(() => {
    if (blocking) {
      socket.current?.close();
      setTimeout(() => {
        setTriggerConnection((n) => n + 1);
      }, 100);
    }
  }, [blocking]);

  useEffect(() => {
    let interval;
    if (Date.now() < delayTarget) {
      interval = setInterval(() => {
        setTriggerTick((n) => n + 1);
        if (Date.now() >= delayTarget) clearInterval(interval);
      }, 250);
    }
  }, [delayTarget]);

  const messageCount =
    Object.values(liveState?.RaceControlMessages?.Messages ?? []).length +
    Object.values(liveState?.TeamRadio?.Captures ?? []).length;
  useEffect(() => {
    if (messageCount > 0) {
      try {
        new Audio("/notif.mp3").play();
      } catch (e) {}
    }
  }, [messageCount]);

  if (!connected)
    return (
        <>
            <Head>
                <title>No Connection – Turn One</title>
            </Head>
            <main>
                <div
                    style={{
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#0E0E0E", // dark background
                        color: "#f1f5f9",
                        textAlign: "center",
                        padding: "2rem",
                        //fontFamily: "Arial, sans-serif",
                        //fontFamily: "SF Pro Display",
                    }}
                >
                    {/* Logo Turn One */}
                    <img
                        src="/logo-turnone.png"
                        alt="Turn One Logo"
                        style={{
                            width: "120px",
                            marginBottom: "1.5rem",
                            //filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.4))",
                        }}
                    />

                    <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#FC3029", marginBottom: "1rem" }}>
                        NO CONNECTION DETECTED
                    </h1>

                    <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#cbd5e1" }}>
                        We're having trouble connecting to the live dashboard.
                    </p>
                    <p style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "#94a3b8" }}>
                        Please check your internet connection or try again shortly.
                    </p>

                    {/* Retry Button */}
                    <button
                        onClick={() => location.reload()}
                        style={{
                            backgroundColor: "#FC3029",
                            color: "#fff",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.5rem",
                            border: "none",
                            cursor: "pointer",
                            //fontWeight: "bold",
                            transition: "background-color 0.3s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = "#ee211b")}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = "#FC3029")}
                    >
                        Retry Connection
                    </button>

                    {/* Powered by */}
                    <p style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#64748b" }}>
                        Powered by <strong>Turn One</strong> – Live F1 Telemetry & Race Tools
                    </p>
                </div>
            </main>
        </>
    );

  if (Date.now() < delayTarget)
    return (
        <>
            <Head>
                <title>Syncing – Turn One</title>
            </Head>
            <main>
                <div
                    style={{
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#0E0E0E",
                        color: "#f1f5f9",
                        textAlign: "center",
                        padding: "2rem",
                    }}
                >
                    {/* Logo Turn One */}
                    <img
                        src="/logo-turnone.png"
                        alt="Turn One Logo"
                        style={{
                            width: "120px",
                            marginBottom: "1.5rem",
                        }}
                    />

                    <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#FC3029", marginBottom: "1rem" }}>
                        SYNCING SESSION
                    </h1>

                    <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#cbd5e1" }}>
                        Preparing live telemetry…
                    </p>

                    {/* Dynamic countdown */}
                    <p style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "#94a3b8" }}>
                        Session starts in <strong>{Math.max(0, ((delayTarget - Date.now()) / 1000).toFixed(1))}s</strong>
                    </p>

                    {/* Spinner (optional) */}
                    <div
                        style={{
                            border: "4px solid #1e293b",
                            borderTop: "4px solid #FC3029",
                            borderRadius: "50%",
                            width: "48px",
                            height: "48px",
                            animation: "spin 1s linear infinite",
                        }}
                    />

                    {/* Spinner keyframes */}
                    <style>
                        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
                    </style>

                    {/* Powered by */}
                    <p style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#64748b" }}>
                        Powered by <strong>Turn One</strong> – Real-Time F1 Analysis
                    </p>
                </div>
            </main>
        </>
    );
    const countryCodeMap = {
        "Australia": "au",
        "Saudi Arabia": "sa",
        "China": "cn",
        "Azerbaijan": "az",
        "United States": "us", // Miami, Austin, Las Vegas
        "Italy": "it", // Imola, Monza
        "Monaco": "mc",
        "Spain": "es",
        "Canada": "ca",
        "Austria": "at",
        "United Kingdom": "gb",
        "Hungary": "hu",
        "Belgium": "be",
        "Netherlands": "nl",
        "Singapore": "sg",
        "Japan": "jp",
        "Qatar": "qa",
        "Mexico": "mx",
        "Brazil": "br",
        "Abu Dhabi": "ae", // UAE
        "Bahrain": "bh",
        "South Africa": "za", // (dacă apare în viitor)
        "Portugal": "pt", // (dacă apare)
        "Germany": "de", // (pentru Nürburgring/Hockenheim)
        "France": "fr", // (pentru Paul Ricard)
        "Turkey": "tr", // (pentru Istanbul Park)
    };

  const {
    Heartbeat,
    SessionInfo,
    TrackStatus,
    LapCount,
    ExtrapolatedClock,
    WeatherData,
    DriverList,
    SessionData,
    RaceControlMessages,
    TimingData,
    TimingAppData,
    TimingStats,
    CarData,
    Position,
    TeamRadio,
  } = liveState;

  if (!Heartbeat)
    return (
        <>
            <Head>
                <title>No Live Session – Turn One</title>
            </Head>
            <main>
                <div
                    style={{
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#0E0E0E", // dark background
                        color: "#f1f5f9",
                        textAlign: "center",
                        padding: "2rem",
                        //fontFamily: "Arial, sans-serif",
                        //fontFamily: "SF Pro Display",
                    }}
                >
                    {/* Logo Turn One */}
                    <img
                        src="/logo-turnone.png"
                        alt="Turn One Logo"
                        style={{
                            width: "120px",
                            marginBottom: "1.5rem",
                            //filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.4))",
                        }}
                    />

                    <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#FC3029", marginBottom: "1rem" }}>
                        NO LIVE SESSION AVAILABLE
                    </h1>

                    <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#cbd5e1" }}>
                        The live F1 dashboard is currently offline.
                    </p>
                    <p style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "#94a3b8" }}>
                        Check back during an active session or refresh the page.
                    </p>

                    {/* Optional Refresh Button */}
                    <button
                        onClick={() => location.reload()}
                        style={{
                            backgroundColor: "#FC3029",
                            color: "#fff",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.5rem",
                            border: "none",
                            cursor: "pointer",
                            //fontWeight: "bold",
                            transition: "background-color 0.3s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = "#dc2626")}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = "#FC3029")}
                    >
                        Refresh Page
                    </button>

                    {/* Powered by */}
                    <p style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#64748b" }}>
                        Powered by <strong>Turn One</strong> – F1 Telemetry & Analysis
                    </p>
                </div>
            </main>
        </>

    );

  const extrapolatedTimeRemaining =
    ExtrapolatedClock.Utc && ExtrapolatedClock.Remaining
      ? ExtrapolatedClock.Extrapolating
        ? moment
            .utc(
              Math.max(
                moment
                  .duration(ExtrapolatedClock.Remaining)
                  .subtract(
                    moment.utc().diff(moment.utc(ExtrapolatedClock.Utc))
                  )
                  .asMilliseconds() + delayMs,
                0
              )
            )
            .format("HH:mm:ss")
        : ExtrapolatedClock.Remaining
      : undefined;
    const countryName = SessionInfo.Meeting.Country.Name;
    const countryCode = countryCodeMap[countryName] || "xx";
  return (

    <>
      <Head>
        <title>
          {SessionInfo.Meeting.Circuit.ShortName}: {SessionInfo.Name}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-3)",
              borderBottom: "1px solid var(--colour-border)",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {!!SessionInfo && (
                <>
                  <p style={{ marginRight: "var(--space-4)" }}>
                      <img
                          src={`https://flagcdn.com/w160/${countryCode}.png`}
                          alt={countryName}
                          style={{ width: "70px", height: "40px", objectFit: "cover", borderRadius: "5px" }}
                      />

                  </p>
                  <strong>
                      {SessionInfo.Meeting.Circuit.ShortName}
                      <br/>
                      <p style={{marginTop:"5px"}}> {SessionInfo.Name} </p>
                  </strong>
                </>
              )}
              {/*{!!TrackStatus && (*/}
              {/*  <p style={{ marginRight: "var(--space-4)" }}>*/}
              {/*    Status: {TrackStatus.Message}*/}
              {/*  </p>*/}
              {/*)}*/}
              {/*{!!extrapolatedTimeRemaining && (*/}
              {/*  <p style={{ marginRight: "var(--space-4)" }}>*/}
              {/*    Remaining: {extrapolatedTimeRemaining}*/}
              {/*  </p>*/}
              {/*)}*/}
            </div>

              {!!WeatherData && (
                  <div
                      style={{
                          display: "flex",
                          padding: "var(--space-1)",
                          //borderBottom: "1px solid var(--colour-border)",
                          overflowX: "auto",
                      }}
                  >
                      {Object.entries(WeatherData).map(([k, v]) =>
                          !excludedKeys.includes(k) ? (
                              <p
                                  key={`weather-${k}`}
                                  style={{ marginRight: "var(--space-4)", display: "flex", alignItems: "center", gap: "0.5rem" }}
                              >
                                  <WeatherCircle value={v} unit={getWeatherUnit(k)} color={getColorForKey(k)} />
                                  {/*<span>{v}{getWeatherUnit(k)}</span>*/}
                                  {k}
                              </p>

                          ) : null
                      )}
                  </div>
              )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {/*<p style={{ marginRight: "var(--space-4)" }}>*/}
              {/*  Data updated: {moment.utc(updated).format("HH:mm:ss.SSS")} UTC*/}
              {/*</p>*/}


              {!!LapCount && (
                <p style={{ marginRight: "var(--space-4)",
                    fontSize: "1rem",
                    backgroundColor: "#1e1d1d",
                    padding:"0.5rem 0.5rem",
                    borderRadius: "0.5rem",
                    filter: "drop-shadow(0 0 8px #272525)", }}>
                  {LapCount.CurrentLap} / {LapCount.TotalLaps}
                </p>
              )}
              {/* Delay */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = new FormData(e.target);
                        const delayMsValue = Number(form.get("delayMs"));
                        setBlocking(true);
                        setDelayMs(delayMsValue);
                        setDelayTarget(Date.now() + delayMsValue);
                    }}
                >
                    <label
                        htmlFor="delayMs"
                        style={{
                            color: "#f1f5f9",
                            fontSize: "1rem",
                            fontWeight: "500",
                            marginRight: "var(--space-2)",
                        }}
                    >
                        Delay
                    </label>

                    <input
                        type="number"
                        name="delayMs"
                        id="delayMs"
                        defaultValue={delayMs}
                        placeholder="ms"
                        style={{
                            width: "80px",
                            padding: "0.5rem 0.3rem",
                            backgroundColor: "#0e0e0e",
                            border: "1px solid #3b3b3b",
                            borderRadius: "0.375rem",
                            color: "#f1f5f9",
                            fontSize: "0.95rem",
                            outline: "none",
                            marginRight: "var(--space-2)",
                            transition: "border-color 0.3s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#FC3029")}
                        onBlur={(e) => (e.target.style.borderColor = "#3b3b3b")}
                    />
                </form>
                <span
                    style={{
                        display: "inline-block",
                        width: "15px",
                        height: "15px",
                        borderRadius: "50%",
                        backgroundColor: "limegreen",
                        marginRight: "var(--space-2)",
                        //border: "2px solid white",
                    }}
                />
            </div>
          </div>

        </>

        <div>
          
          <ResponsiveTable
            style={{
              gridTemplateColumns: !TimingData ? "1fr" : undefined,
            }}
          >
            {!!TimingData && !!CarData ? (
              <>
                {(() => {
                  const lines = Object.entries(TimingData.Lines).sort(
                    sortPosition
                  );
                  return (
                    <>
                      <div
                        style={{
                          borderRight: "1px solid var(--colour-border)",
                        }}
                      >
                        <TableHeader />
                        {lines.slice(0, 20).map(([racingNumber, line]) => (
                          <Driver
                            key={`timing-data-${racingNumber}`}
                            racingNumber={racingNumber}
                            line={line}
                            DriverList={DriverList}
                            CarData={CarData}
                            TimingAppData={TimingAppData}
                            TimingStats={TimingStats}
                          />
                        ))}
                      </div>
                      {/* <div>
                        <TableHeader />
                        {lines
                          .slice(10, 20)
                          .map(([racingNumber, line], pos) => (
                            <Driver
                              key={`timing-data-${racingNumber}`}
                              racingNumber={racingNumber}
                              line={line}
                              DriverList={DriverList}
                              CarData={CarData}
                              TimingAppData={TimingAppData}
                              TimingStats={TimingStats}
                            />
                          ))}
                      </div> */}
                    </>
                  );
                })()}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p>NO DATA YET</p>
              </div>
            )}
            
            <div>
              {!!Position ? (
              <Map
                circuit={SessionInfo.Meeting.Circuit.Key}
                Position={Position.Position[Position.Position.length - 1]}
                DriverList={DriverList}
                TimingData={TimingData}
                TrackStatus={TrackStatus}
                WindDirection={WeatherData.WindDirection}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "400px",
                }}
              >
                <p>NO DATA YET</p>
              </div>
            )}
            <div
              style={{
                padding: "var(--space-2) var(--space-3)",
                backgroundColor: "var(--colour-offset)",
              }}
            >
              <p>
                <strong>TEAM RADIO</strong>
              </p>
            </div>
            <div style={{ borderRight: "1px solid var(--colour-border)" }}>
              {!!TeamRadio ? (
              <ul
                style={{
                  listStyle: "none",
                  height: "400px",
                  overflow: "auto",
                  flexGrow: 1,
                }}
              >
                {[...Object.values(TeamRadio.Captures).sort(sortUtc)].map(
                  (radio, i) => {
                    const driver = DriverList[radio.RacingNumber];
                    return (
                      <Radio
                        key={`team-radio-${radio.Utc}-${i}`}
                        radio={radio}
                        path={`${f1Url}/static/${SessionInfo.Path}${radio.Path}`}
                        driver={driver}
                      />
                    );
                  }
                )}
              </ul>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <p>NO DATA YET</p>
              </div>
            )}
            </div>
            
            </div>
            
          </ResponsiveTable>
        </div>

        <ResponsiveTable
          cols="2fr 2fr"
          //cols="2fr 2fr 1fr"
          style={{
            borderBottom: "1px solid var(--colour-border)",
          }}
        >
          

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--colour-border)",
            }}
          >
            <div
              style={{
                padding: "var(--space-2) var(--space-3)",
                backgroundColor: "var(--colour-offset)",
              }}
            >
              <p>
                <strong>RACE CONTROL MESSAGES</strong>
              </p>
            </div>
            {!!RaceControlMessages ? (
              <ul
                style={{
                  listStyle: "none",
                  height: "200px",
                  overflow: "auto",
                  flexGrow: 1,
                }}
              >
                {[
                  ...Object.values(RaceControlMessages.Messages),
                  ...Object.values(SessionData.StatusSeries),
                ]
                  .sort(sortUtc)
                  .map((event, i) => (
                    <li
                      key={`race-control-${event.Utc}-${i}`}
                      style={{ padding: "var(--space-3)", display: "flex" }}
                    >
                      <span
                        style={{
                          color: "grey",
                          whiteSpace: "nowrap",
                          marginRight: "var(--space-4)",
                        }}
                      >
                        {moment.utc(event.Utc).format("HH:mm:ss")}
                        {event.Lap && ` / Lap ${event.Lap}`}
                      </span>
                      {event.Category === "Flag" && (
                        <span
                          style={{
                            backgroundColor: getFlagColour(event.Flag).bg,
                            color:
                              getFlagColour(event.Flag).fg ??
                              "var(--colour-fg)",
                            border: "1px solid var(--colour-border)",
                            borderRadius: "5px",
                            padding: "0 var(--space-2)",
                            marginRight: "var(--space-3)",
                            width: "40px",
                          }}
                        >
                          {/* FLAG */}
                        </span>
                      )}
                      {event.Message && <span>{event.Message.trim()}</span>}
                      {event.TrackStatus && (
                        <span>TrackStatus: {event.TrackStatus}</span>
                      )}
                      {event.SessionStatus && (
                        <span>SessionStatus: {event.SessionStatus}</span>
                      )}
                    </li>
                  ))}
              </ul>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <p>NO DATA YET</p>
              </div>
            )}
            
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--colour-border)",
            }}
          >
            <div
              style={{
                padding: "var(--space-2) var(--space-3)",
                backgroundColor: "var(--colour-offset)",
                borderBottom: "1px solid var(--colour-border)",
              }}
            >
              <p>
                <strong>SPEED TRAP DATA</strong>
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: speedTrapColumns,
                padding: "var(--space-2) 24px var(--space-2) var(--space-3)",
                backgroundColor: "var(--colour-offset)",
              }}
            >
              <p >DRIVER</p>
              <p >SECTOR 1</p>
              <p>SECTOR 2</p>
              <p>FINISH LINE</p>
              <p>SPEED TRAP</p>
            </div>
            {!!TimingData && !!DriverList && (
              <ul
                style={{
                  listStyle: "none",
                  height: "200px",
                  overflow: "auto",
                  flexGrow: 1,
                }}
              >
                {Object.entries(TimingData.Lines)
                  .sort(sortPosition)
                  .map(([racingNumber, line]) => (
                    <SpeedTrap
                      key={`speed-trap-${racingNumber}`}
                      racingNumber={racingNumber}
                      driver={DriverList[racingNumber]}
                      line={line}
                      statsLine={TimingStats.Lines[racingNumber]}
                    />
                  ))}
              </ul>
            )}  
            
          </div>
          
        </ResponsiveTable>
      </main>
    </>
  );
}
