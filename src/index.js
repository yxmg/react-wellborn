import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Square(props) {
    return (
        <button className={`square ${props.active ? 'active' : ''}`} onClick={props.onClick}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                active={this.props.line && this.props.line.includes(i)}
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
            currentStep: 0,
            ascSort: true
        }
    }

    handleSquareClick(i) {
        const { history, xIsNext, currentStep, ascSort } = this.state
        const newHistory = ascSort
            ? history.slice(0, currentStep + 1)
            : history.slice(currentStep, history.length)

        const lastHistory = newHistory[ascSort ? currentStep : 0]
        if (calculateWinner(lastHistory.squares).winner || lastHistory.squares[i]) {
            return;
        }
        const squares = [...lastHistory.squares]
        squares[i] = xIsNext ? 'X' : 'O'
        this.setState({
            history: ascSort
                ? [...newHistory, { squares, x: Math.floor(i / 3), y: i % 3 }]
                : [{ squares, x: Math.floor(i / 3), y: i % 3 }, ...newHistory],
            xIsNext: !xIsNext,
            currentStep: ascSort ? newHistory.length : 0
        })
    }

    rollbackTo(stepIndex) {
        this.setState({
            currentStep: stepIndex,
            xIsNext: stepIndex % 2 === 0
        })
    }

    sortHistory() {
        const { ascSort, history } = this.state
        const reversedHistory = [...history].reverse()
        this.setState({
            ascSort: !ascSort,
            history: reversedHistory,
            currentStep: !ascSort ? history.length - 1 : 0
        })
    }

    render() {
        const { ascSort, xIsNext, history, currentStep } = this.state
        const current = history[currentStep]
        const { winner, line } = calculateWinner(current.squares)
        console.log(line, "line")
        const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`
        const historyList = history.map((item, stepIndex) => {
            const startIndex = ascSort ? 0 : history.length - 1
            const desc = stepIndex === startIndex
                ? 'Game Start'
                : `Go to #${stepIndex}：${item.x + 1}, ${item.y + 1}`

            return (
                <li
                    key={`${item.x}-${item.y}`}
                    className={
                        stepIndex === currentStep ? 'active ' : ''
                            + (ascSort && stepIndex > currentStep ? 'determined ' : '')
                            + (!ascSort && stepIndex < currentStep ? 'determined' : '')
                    }
                >
                    <button onClick={() => this.rollbackTo(stepIndex)}>{desc}</button>
                </li>
            )
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        line={line}
                        squares={current.squares}
                        onClick={(i) => this.handleSquareClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div className="history-title">
                        <button onClick={() => this.sortHistory()}>↑↓</button>
                        &nbsp;
                        Step List:
                    </div>
                    <ol className="history-list" reversed={!ascSort}>{historyList}</ol>
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
            return { winner: squares[a], line: lines[i] }
        }
    }
    return {}
}

// 入口
ReactDOM.render(<Game/>, document.getElementById('root'))
