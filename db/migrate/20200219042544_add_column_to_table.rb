class AddColumnToTable < ActiveRecord::Migration[5.2]
  def change
    add_column :type_race_stats, :accuracy, :integer
  end
end
