import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import Card from "src/js/card";
import Publish from "src/js/publish";
import cards_json from "src/cards.json";
import { saveAs } from "file-saver";
import "style/index.scss";

export const CARD = {
  bird: { color: "#0D47A1" },
  action: { color: "#37474f" },
  quick: { color: "#37474f" },
  field: { color: "#006064" },
  project: { color: "#673AB7" },
  item: { color: "#006064" },
};

const ArchInput = ({ defaultValue, onChange }) => {
  let change_timer;
  const triggerChange = (e) => {
    if (change_timer) clearTimeout(change_timer);
    let new_value = e.target.value;
    change_timer = setTimeout(() => {
      onChange(defaultValue, new_value);
    }, 1500);
  };

  return (
    <input type="text" defaultValue={defaultValue} onChange={triggerChange} />
  );
};

const DisplayArch = ({ cards }) => {
  const { arch } = useParams();
  return (
    arch &&
    cards[arch] && (
      <div className="display--arch">
        {Array(7)
          .fill()
          .map((_, y) => (
            <div key={y} className="publish--row">
              {Array(10)
                .fill()
                .map((_, x) =>
                  cards[arch][y * 10 + x] ? (
                    <Card key={x} {...cards[arch][y * 10 + x]} />
                  ) : (
                    <div key={x} className="publish--filler" />
                  )
                )}
            </div>
          ))}
      </div>
    )
  );
};

const App = () => {
  const [cards, setCards] = useState();
  const [cardlist, setCardlist] = useState();
  const [oldName, setOldName] = useState();
  const [focusCard, setFocusCard] = useState();
  const [viewType, setViewType] = useState("list"); // list, cards
  const [showPublish, setShowPublish] = useState();

  useEffect(() => {
    if (!localStorage.getItem("cards")) {
      setCards(cards_json);
      localStorage.setItem("cards", JSON.stringify(cards_json));
    } else {
      setCards(JSON.parse(localStorage.getItem("cards")));
    }
  }, []);

  useEffect(() => {
    if (cards) {
      setCardlist(
        Object.keys(cards).reduce(
          (arr, c) =>
            cards[c]
              ? arr.concat(
                  { archetype: c },
                  cards[c].map((card, i) => ({
                    ...card,
                    _arch: c,
                    _index: `${c}-${i}`,
                  }))
                )
              : arr,
          []
        )
      );
    }
  }, [cards]);

  useEffect(() => {
    if (cardlist && cardlist[1] && !focusCard) {
      setOldName(cardlist[1].name);
      setFocusCard(cardlist[1]);
    }
  }, [cardlist, focusCard]);

  const saveCards = (new_cards) => {
    localStorage.setItem("cards", JSON.stringify(new_cards));
    setCards(new_cards);
  };

  const selectCard = (card) => {
    setOldName(card.name);
    setFocusCard(card);
  };

  const updateFocusCard = (k, v) => setFocusCard({ ...focusCard, [k]: v });

  return !cards ? null : (
    <Router>
      <Switch>
        <Route path="/arch/:arch">
          <DisplayArch cards={cards} />
        </Route>
        <Route exact path="/">
          <div className="App">
            {showPublish && (
              <Publish cards={cards} onClose={() => setShowPublish()} />
            )}
            <div className="cardview-header">
              {cardlist && focusCard && (
                <select
                  className="card-select"
                  value={focusCard.name}
                  onChange={(e) => {
                    let card = cardlist.filter(
                      (c) => c.name === e.target.value
                    )[0];
                    if (card) {
                      selectCard(card);
                    }
                  }}
                >
                  {cardlist.map((c) =>
                    c.archetype ? (
                      <option key={c.archetype} disabled>
                        {`--- ${c.archetype} ---`}
                      </option>
                    ) : (
                      <option key={c.name} value={c.name}>
                        {`${c.name} (${c.type.slice(0, 1).toUpperCase()})`}
                      </option>
                    )
                  )}
                </select>
              )}
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(cards)], {
                    type: "text/plain;charset=utf-8",
                  });
                  saveAs(blob, "cards.json");
                }}
              >
                Export JSON
              </button>
              <button
                onClick={() => {
                  const header = [
                    "archetype",
                    "name",
                    "type",
                    "level",
                    "descr",
                    "flavor",
                  ];
                  const rows = Object.keys(cards)
                    .reduce(
                      (arch_rows, arch) => [
                        ...arch_rows,
                        [arch, ...header.map((h) => "")],
                        ...cards[arch].map((entry) =>
                          [""].concat(
                            Object.values(entry).map((v) => {
                              if (typeof v === "boolean")
                                return v ? "TRUE" : "FALSE";
                              if (!isNaN(v)) return Number(v);
                              if (typeof v === "string")
                                return `"${v.replace(
                                  /\\([\s\S])|(["'])/g,
                                  "$1$2$2"
                                )}"`;
                              return v;
                            })
                          )
                        ),
                      ],
                      []
                    )
                    .map((r) => r.join(","))
                    .join("\n");

                  const blob = new Blob([header.join(",") + "\n" + rows], {
                    type: "text/plain;charset=utf-8",
                  });
                  saveAs(blob, "cards.csv");
                }}
              >
                Export CSV
              </button>
              <button onClick={() => setShowPublish(!showPublish)}>
                Publish
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to load the JSON?")
                  ) {
                    setCards(cards_json);
                    localStorage.setItem("cards", JSON.stringify(cards_json));
                  }
                }}
              >
                Reload JSON
              </button>
            </div>
            {focusCard && (
              <div className="cardview">
                <Card key={focusCard.name} {...focusCard} />
                <div className="cardview-inputs">
                  <input
                    name="name"
                    placeholder="name"
                    type="text"
                    value={focusCard.name || ""}
                    onChange={(e) =>
                      updateFocusCard(e.target.name, e.target.value)
                    }
                  />
                  <input
                    name="art"
                    placeholder="<art>.png"
                    type="text"
                    value={focusCard.art || ""}
                    onChange={(e) =>
                      updateFocusCard(e.target.name, e.target.value)
                    }
                  />
                  <input
                    name="level"
                    type="number"
                    value={focusCard.level || 0}
                    onChange={(e) =>
                      updateFocusCard(e.target.name, e.target.value)
                    }
                  />
                  <select
                    name="type"
                    value={focusCard.type || "bird"}
                    onChange={(e) =>
                      updateFocusCard(e.target.name, e.target.value)
                    }
                  >
                    {Object.keys(CARD).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="descr"
                    placeholder="description"
                    type="text"
                    value={focusCard.descr || ""}
                    rows={4}
                    onChange={(e) =>
                      updateFocusCard(e.target.name, e.target.value)
                    }
                  />
                  <input
                    name="flavor"
                    placeholder="flavor"
                    type="text"
                    value={focusCard.flavor || ""}
                    onChange={(e) =>
                      updateFocusCard(e.target.name, e.target.value)
                    }
                  />
                  <div className="form-buttons">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${oldName}?`)) {
                          const new_cards = JSON.parse(JSON.stringify(cards));
                          Object.keys(new_cards).forEach((arch) => {
                            new_cards[arch] = cards[arch].filter(
                              (cc) => cc.name !== oldName
                            );
                          });
                          saveCards(new_cards);
                          selectCard(cardlist[1]);
                        }
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        const new_cards = JSON.parse(JSON.stringify(cards));
                        Object.keys(new_cards).forEach((arch) => {
                          new_cards[arch] = new_cards[arch].map((card) =>
                            card.name === oldName ? { ...focusCard } : card
                          );
                        });
                        saveCards(new_cards);
                        setOldName(focusCard.name);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="view-changer">
              view type:
              <button onClick={() => setViewType("list")}>list</button>
              <button onClick={() => setViewType("cards")}>cards</button>
            </div>
            <div className="small-cards">
              {cards &&
                Object.keys(cards)
                  .sort()
                  .map((arch) => (
                    <div className="card-group" key={arch}>
                      <div key={arch} className="card-archetype">
                        <ArchInput
                          defaultValue={arch || ""}
                          onChange={(lastv, newv) => {
                            const new_cards = { ...cards };
                            delete new_cards[lastv];
                            new_cards[newv] = [...cards[lastv]];
                            saveCards(new_cards);
                          }}
                        />
                        <button
                          onClick={() => {
                            const new_card = {
                              name: `${arch}-${cards[arch].length}`,
                              type: "bird",
                              level: 0,
                              descr: "",
                              flavor: "",
                            };
                            saveCards({
                              ...cards,
                              [arch]: [...cards[arch], new_card],
                            });
                            selectCard(new_card);
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            window.confirm(`Delete ${arch}?`) &&
                            saveCards({
                              ...cards,
                              [arch]: undefined,
                            })
                          }
                        >
                          -
                        </button>
                      </div>
                      <div className={`card-${viewType}`}>
                        {cards[arch] &&
                          cards[arch]
                            .sort((a, b) => {
                              const type =
                                a.type.charCodeAt(0) - b.type.charCodeAt(0);
                              if (type !== 0) return type;
                              const level = b.level - a.level;
                              return level;
                            })
                            .map((c) => (
                              <div
                                key={c.name}
                                className={`card-wrapper${
                                  oldName === c.name ? " selected" : ""
                                }`}
                                title={c.name}
                                onClick={() => selectCard(c)}
                              >
                                {viewType === "cards" ? (
                                  <Card {...c} />
                                ) : (
                                  <div
                                    className="card-list-item"
                                    style={{
                                      borderColor: CARD[c.type].color,
                                    }}
                                  >
                                    {`${c.level} / ${c.type
                                      .slice(0, 1)
                                      .toUpperCase()} - ${c.name}: ${
                                      c.descr || "--"
                                    }`}
                                  </div>
                                )}
                              </div>
                            ))}
                      </div>
                    </div>
                  ))}
            </div>
            <button
              className="card-archetype"
              onClick={() => saveCards({ ...cards, new_arch: [] })}
            >
              + archetype
            </button>
          </div>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
