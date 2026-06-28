import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, HelpCircle, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { QuizQuestion } from '../types';
import { QUIZ_QUESTIONS } from '../data';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (xpGained: number) => void;
}

export default function QuizModal({ isOpen, onClose, onQuizComplete }: QuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleOptionSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optIdx);
  };

  const handleVerify = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      const xpGained = score * 50; // 50 XP per correct answer
      onQuizComplete(xpGained);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <AnimatePresence mode="wait">
      <div id="quiz-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-cream-base dark:bg-charcoal-dark border border-emerald-medium/10 shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-cream-darker dark:border-charcoal-light/30 bg-emerald-medium text-white">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-bright animate-bounce" />
              <h3 className="font-serif font-semibold tracking-tight text-lg">Quiz Spirituel Quotidien</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {!quizFinished ? (
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-emerald-light dark:text-emerald-fixed uppercase font-medium tracking-wider">
                    <span>Question {currentIdx + 1} sur {QUIZ_QUESTIONS.length}</span>
                    <span>Série de Réponses: {score} Correctes</span>
                  </div>
                  <div className="w-full bg-cream-darker dark:bg-charcoal-light/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-medium dark:bg-emerald-fixed h-full transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question */}
                <div className="p-5 rounded-xl bg-white dark:bg-charcoal-card border border-emerald-medium/5 shadow-sm">
                  <div className="flex gap-2.5 items-start">
                    <HelpCircle className="w-5 h-5 text-gold-deep dark:text-gold-bright shrink-0 mt-0.5" />
                    <p className="font-serif text-lg leading-relaxed text-emerald-deep dark:text-cream-base">
                      {currentQuestion.text}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuestion.correctAnswer;
                    
                    let btnClass = "w-full p-4 text-left rounded-xl border text-sm font-sans transition-all duration-200 flex items-center justify-between ";
                    
                    if (!isAnswered) {
                      btnClass += isSelected 
                        ? "border-emerald-medium bg-emerald-medium/5 dark:bg-emerald-fixed/5 text-emerald-deep dark:text-white font-medium" 
                        : "border-cream-darker hover:border-emerald-medium/30 dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card hover:bg-cream-darker/30 dark:hover:bg-charcoal-light/10 text-slate-700 dark:text-cream-base/80";
                    } else {
                      if (isCorrect) {
                        btnClass += "border-green-600 bg-green-500/15 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-medium";
                      } else if (isSelected) {
                        btnClass += "border-red-600 bg-red-500/15 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-medium";
                      } else {
                        btnClass += "border-cream-darker dark:border-charcoal-light/20 bg-white dark:bg-charcoal-card text-slate-400 dark:text-cream-base/30 opacity-70";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isAnswered}
                        className={btnClass}
                      >
                        <span>{option}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 ml-2" />}
                        {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gold-bright/10 border border-gold-muted/20 text-xs leading-relaxed text-gold-deep dark:text-gold-bright space-y-1.5"
                  >
                    <div className="font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Révélation & Contexte:</span>
                    </div>
                    <p>{currentQuestion.explanation}</p>
                    <div className="font-mono text-[10px] uppercase text-emerald-light dark:text-emerald-fixed">
                      Source: {currentQuestion.source}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Quiz Finished Summary */
              <div className="text-center py-8 space-y-6">
                <div className="inline-flex p-4 rounded-full bg-emerald-medium/10 text-emerald-medium dark:text-gold-bright">
                  <Award className="w-16 h-16 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base">
                    Félicitations Seeker !
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-cream-base/60 max-w-sm mx-auto">
                    Vous avez complété l'épreuve théologique d'aujourd'hui. Votre réflexion éclaire votre esprit.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-white dark:bg-charcoal-card p-4 rounded-xl border border-cream-darker dark:border-charcoal-light/20">
                  <div className="text-center border-r border-cream-darker dark:border-charcoal-light/20">
                    <p className="text-xs text-slate-400 dark:text-cream-base/50 uppercase tracking-wide">Score</p>
                    <p className="font-serif text-2xl font-bold text-emerald-deep dark:text-cream-base">
                      {score} / {QUIZ_QUESTIONS.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 dark:text-cream-base/50 uppercase tracking-wide">Points Gagnés</p>
                    <p className="font-serif text-2xl font-bold text-emerald-medium dark:text-gold-bright">
                      +{score * 50} XP
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 max-w-sm mx-auto pt-4">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 border border-emerald-medium text-emerald-medium dark:border-emerald-fixed dark:text-emerald-fixed text-sm font-semibold rounded-xl hover:bg-emerald-medium/5 active:scale-95 transition-all"
                  >
                    Recommencer
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-emerald-medium text-white text-sm font-semibold rounded-xl hover:bg-emerald-deep active:scale-95 transition-all shadow-md"
                  >
                    Fermer le Temple
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          {!quizFinished && (
            <div className="p-5 border-t border-cream-darker dark:border-charcoal-light/30 bg-white/50 dark:bg-charcoal-card/50 flex justify-end">
              {!isAnswered ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleVerify}
                  className="px-6 py-3 bg-emerald-medium text-white text-sm font-semibold rounded-xl hover:bg-emerald-deep disabled:opacity-45 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>Vérifier</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-emerald-medium text-white text-sm font-semibold rounded-xl hover:bg-emerald-deep active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? "Question Suivante" : "Terminer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
