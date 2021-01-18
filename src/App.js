import React, { useState, useEffect, useRef } from "react"
import Card from "src/js/card"
import cards_json from "src/cards.json"
import { saveAs } from "file-saver"
import "style/index.scss"

const App = () => {
  const [cards, setCards] = useState()
  const [cardlist, setCardlist] = useState()
  const [oldName, setOldName] = useState()
  const [focusCard, setFocusCard] = useState()
  const [viewType, setViewType] = useState("list") // list, cards

  useEffect(() => {
    if (!localStorage.getItem("cards")) {
      setCards(cards_json)
      localStorage.setItem("cards", JSON.stringify(cards_json))
    } else {
      setCards(JSON.parse(localStorage.getItem("cards")))
    }
  }, [])

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
                    _index: `${c}-${i}`
                  }))
                )
              : arr,
          []
        )
      )
    }
  }, [cards])

  useEffect(() => {
    if (cardlist && !focusCard) {
      setOldName(cardlist[1].name)
      setFocusCard(cardlist[1])
    }
  }, [cardlist, focusCard])

  const saveCards = new_cards => {
    localStorage.setItem("cards", JSON.stringify(new_cards))
    setCards(new_cards)
  }

  const selectCard = card => {
    setOldName(card.name)
    setFocusCard(card)
  }

  const updateFocusCard = (name, value) =>
    setFocusCard({ ...focusCard, [name]: value })

  return !cards ? null : (
    <div className="App">
      <div className="cardview-header">
        {cardlist && focusCard && (
          <select
            className="card-select"
            value={focusCard.name}
            onChange={e => {
              let card = cardlist.filter(c => c.name === e.target.value)[0]
              if (card) {
                selectCard(card)
              }
            }}
          >
            {cardlist.map(c =>
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
              type: "text/plain;charset=utf-8"
            })
            saveAs(blob, "cards.json")
          }}
        >
          Export
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
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <input
              name="art"
              placeholder="<art>.png"
              type="text"
              value={focusCard.art || ""}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <input
              name="level"
              type="number"
              value={focusCard.level || 0}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <select
              name="type"
              value={focusCard.type || "bird"}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            >
              {["bird", "action", "quick", "field"].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              name="descr"
              placeholder="description"
              type="text"
              value={focusCard.descr || ""}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <input
              name="flavor"
              placeholder="flavor"
              type="text"
              value={focusCard.flavor || ""}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <div className="form-buttons">
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${oldName}?`)) {
                    const new_cards = JSON.parse(JSON.stringify(cards))
                    Object.keys(new_cards).forEach(arch => {
                      new_cards[arch] = cards[arch].filter(
                        cc => cc.name !== oldName
                      )
                    })
                    saveCards(new_cards)
                    selectCard(cardlist[1])
                  }
                }}
              >
                Delete
              </button>
              <button
                onClick={() => {
                  const new_cards = JSON.parse(JSON.stringify(cards))
                  Object.keys(new_cards).forEach(arch => {
                    new_cards[arch] = new_cards[arch].map(card =>
                      card.name === oldName ? { ...focusCard } : card
                    )
                  })
                  saveCards(new_cards)
                  setOldName(focusCard.name)
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
            .map(arch => (
              <div className="card-group" key={arch}>
                <div key={arch} className="card-archetype">
                  <input
                    type="text"
                    value={arch || ""}
                    name="archetype"
                    onChange={e =>
                      saveCards({
                        ...cards,
                        [arch]: undefined,
                        [e.target.value]: cards[arch]
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      saveCards({
                        ...cards,
                        [arch]: [
                          ...cards[arch],
                          {
                            name: `${arch}-${cards[arch].length}`,
                            type: "bird",
                            level: 0,
                            descr: "",
                            flavor: ""
                          }
                        ]
                      })
                    }
                  >
                    +
                  </button>
                  <button
                    onClick={() =>
                      window.confirm(`Delete ${arch}?`) &&
                      saveCards({
                        ...cards,
                        [arch]: undefined
                      })
                    }
                  >
                    -
                  </button>
                </div>
                <div className={`card-${viewType}`}>
                  {cards[arch].map(c => (
                    <div
                      key={c.name}
                      className="card-wrapper"
                      title={c.name}
                      onClick={() => selectCard(c)}
                    >
                      {viewType === "cards" ? (
                        <Card {...c} />
                      ) : (
                        <div className="card-list-item">
                          {`${c.level} / ${c.type
                            .slice(0, 1)
                            .toUpperCase()} - ${c.name}: ${c.descr || "--"}`}
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
  )
}

export default App
