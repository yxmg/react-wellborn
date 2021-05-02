import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => {
                    this.props.onClick(i)
                }}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [{ squares: Array(9).fill(null) }],
            xIsNext: true,
            currentStep: 0
        }
    }

    handleSquareClick(i) {
        const { history, xIsNext, currentStep } = this.state
        const newHistory = history.slice(0, currentStep + 1)
        const lastHistory = newHistory[currentStep]
        if (calculateWinner(lastHistory.squares) || lastHistory.squares[i]) {
            return;
        }
        const squares = [...lastHistory.squares]
        squares[i] = xIsNext ? 'X' : 'O'
        this.setState({
            history: [...newHistory, { squares, x: Math.floor(i / 3), y: i % 3 }],
            xIsNext: !xIsNext,
            currentStep: currentStep + 1
        })
    }

    rollbackTo(stepIndex) {
        this.setState({
            currentStep: stepIndex,
            xIsNext: stepIndex % 2 === 0
        })
    }

    render() {
        const { xIsNext, history, currentStep } = this.state
        const current = history[currentStep]
        const winner = calculateWinner(current.squares)
        const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`
        const historyList = history.map((item, stepIndex) => {
            const desc = stepIndex ? `Go to #${stepIndex}：${item.x + 1}, ${item.y + 1}` : 'Game Start'
            return (
                <li
                    key={stepIndex}
                    className={
                        stepIndex === currentStep ? 'active ' : ''
                        + stepIndex > currentStep ? 'determined' : ''
                    }
                >
                    <button onClick={() => this.rollbackTo(stepIndex)}>{desc}</button>
                </li>
            )
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares} onClick={(i) => this.handleSquareClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol className="history-list">{historyList}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i]
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return squares[a]
        }
    }
}

// 入口
ReactDOM.render(<Game/>, document.getElementById('root'))
