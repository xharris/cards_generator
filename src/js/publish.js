import React, { useState, useEffect, useRef, createRef } from "react"
import Card from "src/js/card"
import { toPng } from "dom-to-image"

const Publish = ({ cards, onClose }) => {
  const archs = Object.keys(cards)
  const el_arch = useRef([])
  const [dataUrls, setDataUrls] = useState({})
  const el_back = useRef()
  const [backUrl, setBackUrl] = useState()

  el_arch.current = Array(archs.length)
    .fill(0)
    .map((ref, i) => (el_arch.current[i] = createRef()))

  useEffect(() => {
    let cancel
    if (el_arch.current)
      el_arch.current.forEach((el, a) => {
        if (el.current) {
          console.log("starting", archs[a])
          setTimeout(
            async () => {
              if (!cancel) {
                toPng(el.current).then(data => {
                  if (!cancel && data) {
                    console.log("loaded", archs[a])
                    setDataUrls({
                      ...dataUrls,
                      [archs[a]]: data
                    })
                  }
                })
              }
            }, 
          2000)
        }
      })
    return () => {
      cancel = true
    }
  }, [el_arch, archs])

  useEffect(() => {
    let cancel
    if (el_back.current)
      toPng(el_back.current).then(data => {
        if (!cancel) setBackUrl(data)
      })
    return () => {
      cancel = true
    }
  }, [el_back])

  return (
    <div className="publish">
      <div className="publish--inner">
        <button onClick={onClose}>X</button>
        {/* {backUrl ? (
          <img src={backUrl} />
        ) : (
          <div className="publish--back-loading" ref={el_back}>
            <Card back />
          </div>
        )} */}
        {archs.map((arch, a) => (
          <div
            key={arch}
            className={[
              "publish--arch",
              !dataUrls[arch] && "publish--arch-loading"
            ]
              .filter(n => n)
              .join(" ")}
          >
            <div className="publish--header">{`${arch}${
              !dataUrls[arch] ? "loading" : ""
            }`}</div>
            {dataUrls[arch] ? (
              <img src={dataUrls[arch]} />
            ) : (
              <div className="publish--cards" ref={el_arch.current[a]}>
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
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Publish
