class CreateTypeRaceStats < ActiveRecord::Migration[5.2]
  def change
    create_table :type_race_stats do |t|
      t.text :text_area
      t.integer :wpm
      t.references :type_race, foreign_key: true
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
