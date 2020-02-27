class TypeRace < ApplicationRecord
  belongs_to :race_templates, optional:true
  has_many :type_race_stats
  has_many :users, through: :type_race_stats
  enum status: [:pending, :ongoing, :completed, :cancel]
end

