import * as React from 'react';
import wasm from './main.go';
import NumberInput from './NumberInput';

const { add } = wasm;

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: [0, 0],
            result: '0'
        };
    }

    async updateValue(index, value) {
        let newValues = this.state.value.slice();
        newValues[index] = value
        let result = await add(...newValues);
        this.setState({ value: newValues, result });
    }

    render() {
        return (
            <div>
                <p>Enter a number in the box below, on change it will add all the numbers together. Click the button to add more input boxes.</p>
                {this.state.value.map((value, index) =>
                    <NumberInput key={index} value={value} onChange={i => this.updateValue(index, i)} />
                )}
                <button type="button" onClick={() => this.setState({ value: [...this.state.value, 0]})}>More inputs!</button>
                <p>Value now is {this.state.result}</p>
            </div>
        );
    }
  }

export default App;