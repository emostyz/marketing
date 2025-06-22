'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/Card'

interface FactorsStepProps {
  dataContext: any; // To be replaced with a more specific type
  setDataContext: React.Dispatch<React.SetStateAction<any>>;
  nextStep: () => void;
  prevStep: () => void;
}

export const FactorsStep: React.FC<FactorsStepProps> = ({ dataContext, setDataContext, nextStep, prevStep }) => {
  const handleAddFactor = () => {
    setDataContext((prev: any) => ({
      ...prev,
      factors: [...prev.factors, '']
    }))
  }

  const handleRemoveFactor = (index: number) => {
    setDataContext((prev: any) => ({
      ...prev,
      factors: prev.factors.filter((_: string, i: number) => i !== index)
    }))
  }

  const handleFactorChange = (index: number, value: string) => {
    setDataContext((prev: any) => ({
      ...prev,
      factors: prev.factors.map((factor: string, i: number) => (i === index ? value : factor))
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Influencing Factors</h2>
        <p className="text-gray-400 mb-8">What external or internal factors might have influenced this data? (e.g., market conditions, seasonality, new product launch)</p>

        <div className="space-y-4">
          {dataContext.factors.map((factor: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder={`Factor ${index + 1}`}
                value={factor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFactorChange(index, e.target.value)}
              />
              <Button variant="ghost" size="icon" onClick={() => handleRemoveFactor(index)} disabled={dataContext.factors.length <= 1}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleAddFactor} className="mt-6">
          <Plus className="w-4 h-4 mr-2" />
          Add Factor
        </Button>
      </Card>

      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} size="lg">
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
} 