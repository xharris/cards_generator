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
              type="text"
              value={focusCard.name || ""}
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
              type="text"
              value={focusCard.descr || ""}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <input
              name="flavor"
              type="text"
              value={focusCard.flavor || ""}
              onChange={e => updateFocusCard(e.target.name, e.target.value)}
            />
            <div className="form-buttons">
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${focusCard.name}?`)) {
                    const new_cards = JSON.parse(JSON.stringify(cards))
                    new_cards[focusCard._arch] = cards[focusCard._arch].filter(
                      cc => cc.name !== focusCard.name
                    )
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
      <div className="small-cards">
        {cardlist &&
          cardlist.map(c =>
            c.archetype ? (
              <div key={c.archetype} className="card-archetype">
                <input
                  type="text"
                  value={c.archetype || ""}
                  name="archetype"
                  onChange={e =>
                    saveCards({
                      ...cards,
                      [c.archetype]: undefined,
                      [e.target.value]: cards[c.archetype]
                    })
                  }
                />
                <button
                  onClick={() =>
                    saveCards({
                      ...cards,
                      [c.archetype]: [
                        ...cards[c.archetype],
                        {
                          name: `${c.archetype}-${cards[c.archetype].length}`,
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
                    window.confirm(`Delete ${c.archetype}?`) &&
                    saveCards({
                      ...cards,
                      [c.archetype]: undefined
                    })
                  }
                >
                  -
                </button>
              </div>
            ) : (
              <div
                key={c._index}
                className="card-wrapper"
                title={c.name}
                onClick={() => selectCard(c)}
              >
                <Card {...c} />
              </div>
            )
          )}
        <button
          className="card-archetype"
          onClick={() => saveCards({ ...cards, new_arch: [] })}
        >
          + archetype
        </button>
      </div>
    </div>
  )
}

export default App
