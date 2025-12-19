import React, { useState, useEffect } from 'react';
import '../../styles/layout/Calculator.css';

interface Bet {
  odd: string;
  stake: string;
  currency: string;
  distribute: boolean;
}

const Calculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [numOutcomes, setNumOutcomes] = useState(2);
  const [bets, setBets] = useState<Bet[]>([
    { odd: '', stake: '', currency: 'USD', distribute: true },
    { odd: '', stake: '', currency: 'USD', distribute: true }
  ]);
  const [totalStake, setTotalStake] = useState('100');
  const [totalCurrency, setTotalCurrency] = useState('USD');
  const [profit, setProfit] = useState('0.00');
  const [profitPercent, setProfitpercent] = useState('0.00');

  const currencies = ['USD', 'EUR', 'BRL', 'PEN'];

  useEffect(() => {
    calculateBets();
  }, [bets, totalStake, numOutcomes]);

  const handleNumOutcomesChange = (value: number) => {
    setNumOutcomes(value);
    const newBets = [...bets];
    if (value > bets.length) {
      for (let i = bets.length; i < value; i++) {
        newBets.push({ odd: '', stake: '', currency: 'USD', distribute: true });
      }
    } else {
      newBets.splice(value);
    }
    setBets(newBets);
  };

  const handleBetChange = (index: number, field: keyof Bet, value: string | boolean) => {
    const newBets = [...bets];
    newBets[index] = { ...newBets[index], [field]: value };
    setBets(newBets);
  };

  const calculateBets = () => {
    try {
      const odds = bets.map(b => parseFloat(b.odd) || 0).filter(o => o > 1);
      const total = parseFloat(totalStake) || 0;

      if (odds.length < 2 || total <= 0) {
        setProfit('0.00');
        setProfitPercent('0.00');
        return;
      }

      // Calcular la suma inversa de las cuotas
      const sumInverse = odds.reduce((acc, odd) => acc + (1 / odd), 0);
      
      // Verificar si es una apuesta segura
      if (sumInverse >= 1) {
        setProfit('0.00');
        setProfitPercent('0.00');
        return;
      }

      // Calcular beneficio porcentual
      const profitPct = ((1 / sumInverse) - 1) * 100;
      setProfitPercent(profitPct.toFixed(2));

      // Distribuir las apuestas
      const newBets = [...bets];
      odds.forEach((odd, idx) => {
        if (idx < newBets.length && newBets[idx].distribute) {
          const stakeAmount = (total / sumInverse) / odd;
          newBets[idx].stake = stakeAmount.toFixed(2);
        }
      });
      setBets(newBets);

      // Calcular beneficio en moneda
      const minReturn = Math.min(...odds.map((odd, idx) => 
        odd * (parseFloat(newBets[idx]?.stake) || 0)
      ));
      const profitAmount = minReturn - total;
      setProfit(profitAmount.toFixed(2));

    } catch (error) {
      console.error('Error calculating bets:', error);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button 
        className={`calculator-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Calculadora de Apuestas Seguras"
      >
        {isOpen ? '✕' : '🧮'}
      </button>

      {/* Panel de calculadora */}
      <div className={`calculator-panel ${isOpen ? 'open' : ''}`}>
        <div className="calculator-header">
          <h2>Calculadora de Apuestas Seguras</h2>
          <div className="profit-display">
            <span className="profit-label">Beneficio:</span>
            <span className={`profit-value ${parseFloat(profit) > 0 ? 'positive' : 'negative'}`}>
              {profit} {totalCurrency}
            </span>
            <span className="profit-percent">({profitPercent}%)</span>
          </div>
        </div>

        <div className="calculator-body">
          {/* Configuración */}
          <div className="config-section">
            <div className="form-group">
              <label>Núm. de resultados:</label>
              <select 
                value={numOutcomes} 
                onChange={(e) => handleNumOutcomesChange(Number(e.target.value))}
                className="form-select"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>

          {/* Tabla de apuestas */}
          <div className="bets-table">
            <div className="table-header">
              <div className="col-odd">Cuota</div>
              <div className="col-stake">Apuesta</div>
              <div className="col-currency">Moneda</div>
              <div className="col-dist">D</div>
            </div>

            {bets.map((bet, index) => (
              <div key={index} className="table-row">
                <div className="col-odd">
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    placeholder="Ej: 2.50"
                    value={bet.odd}
                    onChange={(e) => handleBetChange(index, 'odd', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="col-stake">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={bet.stake}
                    onChange={(e) => handleBetChange(index, 'stake', e.target.value)}
                    className="form-input"
                    disabled={bet.distribute}
                  />
                </div>
                <div className="col-currency">
                  <select
                    value={bet.currency}
                    onChange={(e) => handleBetChange(index, 'currency', e.target.value)}
                    className="form-select"
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                <div className="col-dist">
                  <input
                    type="checkbox"
                    checked={bet.distribute}
                    onChange={(e) => handleBetChange(index, 'distribute', e.target.checked)}
                    className="form-checkbox"
                  />
                </div>
              </div>
            ))}

            {/* Fila de totales */}
            <div className="table-row total-row">
              <div className="col-odd total-label">
                <strong>Apuesta total:</strong>
              </div>
              <div className="col-stake">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalStake}
                  onChange={(e) => setTotalStake(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="col-currency">
                <select
                  value={totalCurrency}
                  onChange={(e) => setTotalCurrency(e.target.value)}
                  className="form-select"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              <div className="col-dist"></div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="info-section">
            <p className="info-text">
              <strong>D</strong> = Distribuir beneficio automáticamente
            </p>
            <p className="info-text small">
              Una apuesta segura existe cuando la suma de las inversas de las cuotas es menor a 1
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="calculator-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Calculator;