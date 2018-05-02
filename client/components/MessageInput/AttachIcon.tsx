import React from 'react';

interface Props {
    className?: string;
}

const AttachIcon: React.SFC<Props> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 19 19" className={className}>
        <g>
            <rect fill="none" id="canvas_background" height="402" width="582" y="-1" x="-1" />
        </g>
        <g>
            <path
                fill="#999999"
                stroke="null"
                d="m7.482054,13.980604l0.7411,0.79175l6.289388,-6.719233c1.648868,-1.761559 1.648868,-4.629552 0,-6.39111c-1.649916,-1.762679 -4.33234,-1.762679 -5.982257,0l-6.813504,7.279169c-1.360604,1.453594 -1.360604,3.817644 0,5.271238c0.679254,0.725677 1.573395,1.090755 2.467537,1.090755s1.787235,-0.363958 2.467537,-1.090755l6.289388,-6.719233c0.518875,-0.554337 0.803993,-1.291213 0.803993,-2.075123s-0.285119,-1.520786 -0.805042,-2.076243c-1.037749,-1.108673 -2.848045,-1.108673 -3.885794,0l-5.765273,6.159297l0.7411,0.79175l5.765273,-6.159297c0.640469,-0.684242 1.763125,-0.684242 2.403595,0c0.320759,0.342681 0.49791,0.798469 0.49791,1.284493s-0.177151,0.941812 -0.49791,1.283373l-6.289388,6.719233c-0.951794,1.016844 -2.500032,1.016844 -3.451826,0s-0.951794,-2.670895 0,-3.687739l6.813504,-7.279169c1.241106,-1.325929 3.258951,-1.325929 4.500057,0s1.241106,3.481683 0,4.807611l-6.289388,6.719233z"
            />
        </g>
    </svg>
);

export default AttachIcon;
