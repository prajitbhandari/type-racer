class AddColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :type_races, :start_time , :DateTime
  end
end
