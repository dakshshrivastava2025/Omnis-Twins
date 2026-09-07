import pandas as pd
import matplotlib.pyplot as plt
import os
import matplotlib.style as style

def main():
    results_path = r"d:\VIT\hackathon\Code2Create\github\models\anomaly_detector\inference_results.csv"
    output_image = r"d:\VIT\hackathon\Code2Create\github\models\anomaly_detector\anomaly_plot.png"
    
    if not os.path.exists(results_path):
        print(f"Error: Could not find {results_path}")
        return
        
    df = pd.read_csv(results_path)
    
    # Use a modern, clean style
    style.use('ggplot')
    
    # Create the figure
    plt.figure(figsize=(14, 6))
    
    # The MSE Error line (Live data tracking)
    plt.plot(df['Time_s'], df['MSE_Score'], label='Reconstruction Error (Live Data)', color='#1f77b4', alpha=0.8, linewidth=2.5)
    
    # The Threshold line
    plt.plot(df['Time_s'], df['Threshold'], label='Dynamic Anomaly Threshold', color='#d62728', linestyle='--', linewidth=2.5)
    
    # Highlight the area where the anomaly occurs with a red fill
    plt.fill_between(df['Time_s'], df['Threshold'], df['MSE_Score'], 
                     where=(df['MSE_Score'] > df['Threshold']), 
                     interpolate=True, color='#d62728', alpha=0.3, label='Detected Anomaly Zone')
    
    # Add a vertical line exactly where the fault was injected (3600 seconds / 1 hour)
    plt.axvline(x=3600, color='black', linestyle=':', alpha=0.7, label='Fault Injection Point (1 Hour)')
    
    # Formatting the chart for the presentation
    plt.title('Autoencoder Anomaly Detection: Live Vehicle Monitoring', fontsize=18, fontweight='bold', pad=15)
    plt.xlabel('Drive Time (Seconds)', fontsize=14, fontweight='bold')
    plt.ylabel('Reconstruction Error (MSE)', fontsize=14, fontweight='bold')
    
    # Make the legend look good
    plt.legend(loc='upper left', fontsize=12, frameon=True, shadow=True, facecolor='white')
    
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    
    # Save the high-res figure for your slides
    plt.savefig(output_image, dpi=300)
    print(f"Plot successfully saved to: {output_image}")
    
    # Display the plot window
    plt.show()

if __name__ == "__main__":
    main()
