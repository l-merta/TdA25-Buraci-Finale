import React from 'react';

const Team: React.FC = () => {
    return (
        <main>
            <div className="background-effect">
                <div className="semicircle main-semicircle"></div>
                <div className="semicircle moving-semicircle"></div>
                <div className="semicircle moving-semicircle2"></div>
            </div>
            <section className="team-info">
            <h1>O týmu - Buráci</h1>
                <div className='text-team'>
                    Jsme Buráci! Jsme tým složený z 3 členů, kteří se rozhodli vytvořit tuto webovou aplikaci. 2 Programátoři a jeden grafik se rozhodli založit tento oříškový tým tento rok za vidinou zlepšení svojich skills a získání nových zkušeností.
                </div>
                <div className='contact-info'>
                    <div>Kontaktní údaje:</div>
                    <div>Buráci s.r.o.</div>
                    <div>Jablunkovská 295</div>
                    <div>739 61 Třinec</div>
                </div>
            <img src="images/buraci-logo2.png" className='buraci-logo'/>
            </section>
        </main>
    ); 
};

export default Team;