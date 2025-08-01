import React from 'react';

const WeatherCircle = ({ value, unit, label, icon, color, type }) => {
    const strokeDasharray = 282; // circumferința cercului (2πr)
    let strokeDashoffset= 0;
    if (type === "WindSpeed"){
        strokeDashoffset = strokeDasharray - (value / 20) * strokeDasharray;
    }else{
        strokeDashoffset = strokeDasharray - (value / 100) * strokeDasharray;
    }

    return (
        <div className="circle-container">
            <svg viewBox="0 0 100 100" className="circle-svg">
                <circle className="bg" cx="50" cy="50" r="40" />
                <circle
                    className="fg"
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={color}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-132 50 50)"
                />
            </svg>
            <div className="circle-content">
                <span className="circle-value">{value}</span>
                <br/>
                <span className="circle-unit">{unit}</span>
                {icon && <span className="circle-icon">{icon}</span>}
                <span className="circle-label">{label}</span>
            </div>
            <div className="type-name">
                {type}
            </div>
        </div>
    );
};

export default WeatherCircle;
