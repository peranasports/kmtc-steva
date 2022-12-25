
function EvalItem({ evalitem, onRatingChange }) {

    const onRating = (r) => {
        onRatingChange(r, evalitem)
        // console.log("Rating ", r.toString())
    }

    return (
        <>
            <div className="mr-10 text-sm">
                {evalitem.name}
            </div>
            <div className="rating rating-sm gap-1">
                {
                    evalitem.rating === 0 ?
                        <div>
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 hidden" defaultChecked='false' />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-red-500" onClick={() => onRating(1)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-orange-500" onClick={() => onRating(2)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-yellow-500" onClick={() => onRating(3)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-lime-500" onClick={() => onRating(4)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-green-500" onClick={() => onRating(5)} />
                        </div>
                        :

                        <div className="flex">
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 hidden" defaultChecked='false' />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-red-500" defaultChecked={evalitem.rating === 1} onClick={() => onRating(1)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-orange-500" defaultChecked={evalitem.rating === 2} onClick={() => onRating(2)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-yellow-500" defaultChecked={evalitem.rating === 3} onClick={() => onRating(3)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-lime-500" defaultChecked={evalitem.rating === 4} onClick={() => onRating(4)} />
                            <input type="radio" name={evalitem.order} className="mask mask-star-2 bg-green-500" defaultChecked={evalitem.rating === 5} onClick={() => onRating(5)} />
                            <p className="ml-2 text-sm">{evalitem.rating}</p>
                        </div>
                }
            </div>
        </>
    )
}

export default EvalItem